using ProcessMiner.Core.Models;
using System.Text;

namespace ProcessMiner.Core.Algorithms
{
    public class AlphaMiner
    {

        public string[] Activities { get; private set; }
        public RelationshipType[,] FootprintMatrix { get; private set; }
        public TimeSpan[,] AverageTrasitionTime { get; private set; }
        public double[] AverageActivityCost { get; private set; }

        private Dictionary<string, int> activityIndexMap;

        public AlphaMiner(IEnumerable<Trace> traces)
        {
            BuildMatrix(traces);
            CalculatePerformance(traces);
        }

        private void BuildMatrix(IEnumerable<Trace> traces)
        {
            var activitySet = new HashSet<string>();
            // Collect all unique activities
            foreach (var trace in traces)
            {
                foreach (var logEvent in trace.Events)
                {
                    activitySet.Add(logEvent.Activity);
                }
            }
            Activities = activitySet.ToArray();

            int n = Activities.Length;
            FootprintMatrix = new RelationshipType[n, n];

            activityIndexMap = Activities.Select((activity, index) => new { activity, index })
                                         .ToDictionary(x => x.activity, x => x.index);

            // First, we need to build the direct follow matrix
            bool[,] directFollowMatrix = new bool[n, n];

            foreach (var trace in traces)
            {
                for (int i = 0; i < trace.Events.Count - 1; i++)
                {
                    int fromIndex = activityIndexMap[trace.Events[i].Activity];
                    int toIndex = activityIndexMap[trace.Events[i + 1].Activity];
                    directFollowMatrix[fromIndex, toIndex] = true;
                }
            }

            // Now, we can build the footprint matrix based on the direct follow matrix
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                { 
                    bool directFollow = directFollowMatrix[i, j]; // a -> b
                    bool inverseDirectFollow = directFollowMatrix[j, i]; // b -> a

                    if (directFollow && inverseDirectFollow)
                    {
                        FootprintMatrix[i, j] = RelationshipType.Concurrent;
                    }
                    else if (directFollow)
                    {
                        FootprintMatrix[i, j] = RelationshipType.Causal;
                    }
                    else if (inverseDirectFollow)
                    {
                        FootprintMatrix[i, j] = RelationshipType.InverseCausal;
                    }
                    else
                    {
                        FootprintMatrix[i, j] = RelationshipType.NoRelation;
                    }

                }
            }
        }

        private void CalculatePerformance(IEnumerable<Trace> traces)
        {
            int n = Activities.Length;
            AverageTrasitionTime = new TimeSpan[n, n];
            var transitionCounts = new int[n, n];
            var totalMiliseconds = new double[n, n];

            AverageActivityCost = new double[n];
            var activityCounts = new int[n];

            // Calculate total transition times and counts
            foreach (var trace in traces)
            {
                for (int i = 0; i < trace.Events.Count - 1; i++)
                {
                    int fromIndex = activityIndexMap[trace.Events[i].Activity];
                    int toIndex = activityIndexMap[trace.Events[i + 1].Activity];

                    if (FootprintMatrix[fromIndex, toIndex] != RelationshipType.NoRelation) 
                    {
                        TimeSpan transitionTime = trace.Events[i + 1].Timestamp - trace.Events[i].Timestamp;
                        transitionCounts[fromIndex, toIndex]++;
                        totalMiliseconds[fromIndex, toIndex] += transitionTime.TotalMilliseconds;
                    }
                }
                // Calculate average activity cost
                foreach (var activity in trace.Events)
                {
                    int index = activityIndexMap[activity.Activity];
                    activityCounts[index]++;
                    AverageActivityCost[index] += activity.Cost;
                }
            }

            // Calculate average transition times and costs
            for (int i = 0; i < n; i++)
            {
                // Cost
                if(activityCounts[i] > 0)
                {
                    AverageActivityCost[i] /= activityCounts[i];
                }

                // Time
                for (int j = 0; j < n; j++)
                {
                    if (transitionCounts[i, j] > 0)
                    {
                        double averageMilliseconds = totalMiliseconds[i, j] / transitionCounts[i, j];
                        AverageTrasitionTime[i, j] = TimeSpan.FromMilliseconds(averageMilliseconds);
                    }
                    else
                    {
                        AverageTrasitionTime[i, j] = TimeSpan.Zero;
                    }
                }
            }
        }

        public string PrintMatrix() 
        { 
            int n = Activities.Length;
            var sb = new StringBuilder();

            int maxColWidth = 0;
            for (int i = 0; i < n; i++)
            {
                int len = $"{i}. {Activities[i]}".Length;
                if (len > maxColWidth) maxColWidth = len;
            }
            maxColWidth += 2;

            sb.Append("".PadRight(maxColWidth) + "|");
            for (int i = 0; i < n; i++)
            {
                sb.Append($" {i,2} |"); 
            }
            sb.AppendLine();

            for (int i = 0; i < n; i++)
            {
                string rowName = $"{i}. {Activities[i]}";
                sb.Append(rowName.PadRight(maxColWidth) + "|");

                for (int j = 0; j < n; j++)
                {
                    string symbol = FootprintMatrix[i, j] switch
                    {
                        RelationshipType.Causal => "->",
                        RelationshipType.InverseCausal => "<-",
                        RelationshipType.Concurrent => "||",
                        RelationshipType.NoRelation => "#",
                        _ => "?"
                    };

                    sb.Append($" {symbol,-2} |");
                }
                sb.AppendLine();
            }
            return sb.ToString();
        }
    }
}
