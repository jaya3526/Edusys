using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Course
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string MediaUrl { get; set; }
        public string InstructorName { get; set; }
    }

}
