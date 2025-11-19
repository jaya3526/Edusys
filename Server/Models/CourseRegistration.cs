namespace Server.Models
{
    public class CourseRegistration
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; } 
        public Guid CourseId { get; set; } 
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    }
}
