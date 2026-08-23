using ProcessMiner.Core.Models;
using System.Runtime.CompilerServices;
using System.Text;

namespace ProcessMiner.Core.Algorithms
{
    public class HeuristicMiner
    {

        public string[] Activities { get; }
        public int[,] DirectSuccessionMatrix { get; }
        public double[,] DependencyMatrix { get; }
        public double[,] ConcurrencyMatrix { get; }

        private readonly Dictionary<string, int> activityIndexMap;

        public HeuristicMiner(IEnumerable<Trace> traces)
        {
            // Extract unique activities from the traces
            var activitySet = new HashSet<string>();
            foreach (var trace in traces)
            {
                foreach (var logEvent in trace.Events)
                {
                    activitySet.Add(logEvent.Activity);
                }
            }

            Activities = activitySet.ToArray();
            int n = Activities.Length;
            DirectSuccessionMatrix = new int[n, n];
            DependencyMatrix = new double[n, n];
            ConcurrencyMatrix = new double[n, n];
            activityIndexMap = Activities.Select((activity, index) => new { activity, index })
                                          .ToDictionary(x => x.activity, x => x.index);

            CalculateDirectSuccession(traces);
            CalculateDependencyAndConcurrency();

        }

        private void CalculateDirectSuccession(IEnumerable<Trace> traces)
        {
            // Calculate the direct succession matrix
            foreach (var trace in traces)
            {
                for (int i = 0; i < trace.Events.Count - 1; i++)
                {
                    string fromActivity = trace.Events[i].Activity;
                    string toActivity = trace.Events[i + 1].Activity;
                    if (activityIndexMap.TryGetValue(fromActivity, out int fromIndex) &&
                        activityIndexMap.TryGetValue(toActivity, out int toIndex))
                    {
                        DirectSuccessionMatrix[fromIndex, toIndex]++;
                    }
                }
            }
        }
        private void CalculateDependencyAndConcurrency() 
        { 
            // Calculate the dependency matrix and concurrency matrix
            int n = Activities.Length;
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    int a = DirectSuccessionMatrix[i, j];
                    int b = DirectSuccessionMatrix[j, i];
                    DependencyMatrix[i, j] = (a - b) / (double)(a + b + 1);
                    ConcurrencyMatrix[i, j] = (a + b) / (double)(a + b + 1);
                }
            }
        }

        public string PrintMatrix()
        {
            var sb = new StringBuilder();
            int n = Activities.Length;

            sb.AppendLine("=== ACTIVITIES LEGEND ===");
            for (int i = 0; i < n; i++)
            {
                sb.AppendLine($"  [{i}] {Activities[i]}");
            }
            sb.AppendLine();

            int colWidth = 28;     
            int rowHeaderWidth = 6; 

            sb.AppendLine("=== HEURISTIC DEPENDENCY MATRIX ===");

            sb.Append("".PadRight(rowHeaderWidth));
            for (int j = 0; j < n; j++)
            {
                sb.Append($"[{j}]".PadRight(colWidth));
            }
            sb.AppendLine();
            sb.AppendLine(new string('-', rowHeaderWidth + (n * colWidth)));

            for (int i = 0; i < n; i++)
            {
                sb.Append($"[{i}]".PadRight(rowHeaderWidth));

                for (int j = 0; j < n; j++)
                {
                    if (i == j)
                    {
                        // No relation to itself, so we can leave it empty or put a placeholder
                        sb.Append("   ---   ".PadRight(colWidth));
                        continue;
                    }

                    double dep = DependencyMatrix[i, j];
                    double conc = ConcurrencyMatrix[i, j];

                    // Fromat: Causal vs Concurrent, e.g., " 0.85 Causal | 0.15 Conc "
                    string cellText = $"{dep,5:F2} Causal | {conc,4:F2} Conc";
                    sb.Append(cellText.PadRight(colWidth));
                }
                sb.AppendLine();
            }

            return sb.ToString();
        }

    }
}
