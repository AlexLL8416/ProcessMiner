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

}
