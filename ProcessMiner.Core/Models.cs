namespace ProcessMiner.Core.Models

{
    public record struct LogEvent(
        string CaseId,

        DateTime Timestamp,

        string Activity,
        string Resource,
        int Cost
        );

    public class Trace 
    {
        public string CaseId { get; }
        public List<LogEvent> Events { get; }

        public Trace(string caseId)
        {
            CaseId = caseId;
            Events = new List<LogEvent>();
        }
    }

    public enum RelationshipType
    {
        Causal,
        InverseCausal,
        Concurrent,
        NoRelation
    }

    public class ProcessVariant 
    {
        // Secuence of activities that define the process variant
        public string Signature { get; set; }

        // Number of cases that follow this process variant
        public int CaseCount { get; set; }

        // Percentage of cases that follow this process variant
        public double Percentage { get; set; }
        // Mean duration and cost of the process variant
        public TimeSpan MeanDuration { get; set; }
        public double MeanCost { get; set; }
    }

}
