namespace Server.Models
{
    public class CourseQuiz
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CourseId { get; set; }
        public string QuizData { get; set; } 
    }

}
