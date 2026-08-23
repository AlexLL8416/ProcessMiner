using ProcessMiner.Core.Models;
using System.Collections.Generic;

namespace ProcessMiner.Api.Models
{
    public class MiningResponse
    {
        public string HeuristicGraphDot { get; set; }
        public string AlphaGraphDot { get; set; }
        public string SocialGraphDot { get; set; }
        public List<ProcessVariant> TopVariants { get; set; }

        public List<string> Activities { get; set; }
        public List<MatrixRow> DependencyMatrix { get; set; }
        public List<MatrixRow> ConcurrencyMatrix { get; set; }
    }

    // Auxiliar classes for clean serialization
    public class MatrixRow
    {
        public string ActivityName { get; set; }
        public List<double> Values { get; set; }
    }
}