namespace Server.Models
{
    public class QuizSubmission
    {
        public int Id { get; set; }
        public string CourseId { get; set; }
        public string StudentId { get; set; }
        public int Marks { get; set; }
        public DateTime TakenTime { get; set; }
    }

}
