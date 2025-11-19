using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Helpers;
using Server.Models;
using System.Security.Claims;
using Azure.Messaging.EventHubs.Producer;
using System.Text;
using Azure.Messaging.EventHubs;
using System.Text.Json;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly EduSyncDbContext _context;
        private readonly AzureBlobStorageHelper _blobHelper;
        private readonly IConfiguration _configuration;

        public CourseController(EduSyncDbContext context, IConfiguration configuration)
        {
            _context = context;
            _blobHelper = new AzureBlobStorageHelper(configuration.GetConnectionString("AzureBlobStorage"));
            _configuration = configuration;
        }

        [HttpPost]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Create([FromForm] IFormFile mediaFile, [FromForm] string title, [FromForm] string description)
        {
            if (mediaFile == null || string.IsNullOrWhiteSpace(title))
                return BadRequest("Media file and title are required.");

            try
            {
                var instructorName = User.Identity?.Name;
                if (string.IsNullOrWhiteSpace(instructorName))
                    return Unauthorized("Instructor identity not found.");

                var mediaUrl = await _blobHelper.UploadFileAsync(mediaFile);

                var course = new Course
                {
                    CourseId = Guid.NewGuid(),
                    Title = title,
                    Description = description,
                    InstructorName = instructorName,
                    MediaUrl = mediaUrl
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                return Ok(course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Update(Guid id, [FromForm] IFormFile mediaFile, [FromForm] string title, [FromForm] string description)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return NotFound();

                var instructorName = User.Identity?.Name;
                if (course.InstructorName != instructorName)
                    return Forbid("You can only update your own courses.");

                if (!string.IsNullOrWhiteSpace(title)) course.Title = title;
                if (!string.IsNullOrWhiteSpace(description)) course.Description = description;

                if (mediaFile != null)
                    course.MediaUrl = await _blobHelper.UploadFileAsync(mediaFile);

                _context.Courses.Update(course);
                await _context.SaveChangesAsync();

                return Ok(course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return NotFound();

                var instructorName = User.Identity?.Name;
                if (course.InstructorName != instructorName)
                    return Forbid("You can only delete your own courses.");

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var courses = await _context.Courses.ToListAsync();

                var courseDtos = courses.Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Description,
                    c.MediaUrl,
                    c.InstructorName
                });

                return Ok(courseDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("instructor")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetInstructorCourses()
        {
            try
            {
                var instructorName = User.Identity?.Name;

                if (string.IsNullOrWhiteSpace(instructorName))
                    return Unauthorized("Instructor identity not found.");

                var courses = await _context.Courses
                    .Where(c => c.InstructorName == instructorName)
                    .ToListAsync();

                var courseDtos = courses.Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Description,
                    c.MediaUrl,
                    c.InstructorName
                });

                return Ok(courseDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{courseId}/register")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> RegisterCourse(Guid courseId)
        {
            try
            {
                var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrWhiteSpace(studentIdClaim))
                    return Unauthorized("Student identity not found.");

                if (!Guid.TryParse(studentIdClaim, out var studentId))
                    return BadRequest("Invalid student ID");

                var registration = new CourseRegistration
                {
                    Id = Guid.NewGuid(),
                    StudentId = studentId,
                    CourseId = courseId
                };

                _context.CourseRegistrations.Add(registration);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Registration successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            try
            {
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.CourseId == id);

                if (course == null)
                    return NotFound("Course not found");

                return Ok(course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("{courseId}/registration-status")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetRegistrationStatus(Guid courseId)
        {
            try
            {
                var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrWhiteSpace(studentIdClaim))
                    return Unauthorized("Student identity not found.");

                if (!Guid.TryParse(studentIdClaim, out var studentId))
                    return BadRequest("Invalid student ID");

                var isRegistered = await _context.CourseRegistrations
                    .AnyAsync(r => r.StudentId == studentId && r.CourseId == courseId);

                return Ok(new { isRegistered });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet(("{courseId}/quiz-results"))]
        public async Task<IActionResult> GetQuizResults(Guid courseId)
        {
            var quizResults = await _context.QuizSubmissions
                .Where(q => q.CourseId == courseId.ToString())
                .ToListAsync();

            if (!quizResults.Any())
            {
                return NotFound("No quiz results found for this course.");
            }

            return Ok(quizResults);
        }

        [HttpGet("{courseId}/performances")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetStudentPerformances(string courseId)
        {
            var performances = await _context.QuizSubmissions
                .Where(qs => qs.CourseId == courseId) 
                .Join(_context.Users,
                      qs => qs.StudentId,
                      u => u.UserId.ToString(),
                      (qs, u) => new
                      {
                          StudentName = u.Name,
                          TakenDate = qs.TakenTime.ToString("yyyy-MM-dd"), 
                          TakenTime = qs.TakenTime.ToString("HH:mm:ss"), 
                          Tmarks = qs.Marks
                      })
                .ToListAsync();  
            return Ok(performances);  
        }

     
        public class QuizSubmissionDto
        {
            public int Marks { get; set; }
        }

        [HttpPost]
        [Route("{courseId}/submit-quiz")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitQuiz(string courseId, [FromBody] QuizSubmissionDto quizSubmissionDto)
        {
            try
            {
                var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrWhiteSpace(studentId))
                    return Unauthorized("Student identity not found.");

                var eventData = new
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    marks = quizSubmissionDto.Marks,
                    TakenTime = DateTime.UtcNow
                };
                string jsonData = JsonSerializer.Serialize(eventData);
                var eventBytes = Encoding.UTF8.GetBytes(jsonData);
                string eventHubConnectionString = _configuration["EventHub:ConnectionString"];
                string eventHubName = _configuration["EventHub:Name"];
                await using (var producerClient = new EventHubProducerClient(eventHubConnectionString, eventHubName))
                {
                    using EventDataBatch eventBatch = await producerClient.CreateBatchAsync();
                    eventBatch.TryAdd(new EventData(eventBytes));
                    await producerClient.SendAsync(eventBatch);
                }
                var quizSubmission = new QuizSubmission
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    Marks = quizSubmissionDto.Marks,
                    TakenTime = DateTime.UtcNow
                };

                await _context.QuizSubmissions.AddAsync(quizSubmission);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Quiz submitted successfully and sent to Event Hub." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Event Hub error: {ex.Message}");
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }

        [HttpPost("{courseId}/add")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> AddOrUpdateQuiz([FromBody] CourseQuiz model, Guid courseId)
        {
            if (model == null || string.IsNullOrEmpty(model.QuizData))
            {
                return BadRequest("Invalid quiz data.");
            }

            var existingQuiz = await _context.CourseQuizzes
                                             .FirstOrDefaultAsync(q => q.CourseId == courseId);

            if (existingQuiz != null)
            {
                existingQuiz.QuizData = model.QuizData;
                _context.CourseQuizzes.Update(existingQuiz);
            }
            else
            {
                model.CourseId = courseId;
                await _context.CourseQuizzes.AddAsync(model);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quiz saved successfully." });
        }


        [HttpGet("{courseId}/quiz-questions")]
        public async Task<IActionResult> GetQuiz(Guid courseId)
        {
            var quiz = await _context.CourseQuizzes
                .FirstOrDefaultAsync(q => q.CourseId == courseId);

            if (quiz == null)
                return NotFound("Quiz not found for the specified course.");

            return Ok(quiz);
        }

    }
}
