using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class EduSyncDbContext : DbContext
    {
        public EduSyncDbContext(DbContextOptions<EduSyncDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
        public DbSet<QuizSubmission> QuizSubmissions { get; set; }

        public DbSet<CourseRegistration> CourseRegistrations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseQuiz> CourseQuizzes { get; set; }
    }
}
