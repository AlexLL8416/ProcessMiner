using System.Collections.Generic;
using System.Linq;
using System.Text;
using ProcessMiner.Core.Models;

namespace ProcessMiner.Core.Algorithms
{
    public class ResourceMining
    {
        public string[] Resources { get; }
        public int[,] HandoverMatrix { get; }

        public ResourceMining(IEnumerable<Trace> traces)
        {
            var resourceSet = new HashSet<string>();
            foreach (var trace in traces)
            {
                foreach (var logEvent in trace.Events)
                {
                    resourceSet.Add(logEvent.Resource);
                }
            }
            Resources = resourceSet.ToArray();
            int n = Resources.Length;
            HandoverMatrix = new int[n, n];
            var resourceIndexMap = Resources.Select((resource, index) => new { resource, index })
                                             .ToDictionary(x => x.resource, x => x.index);
            foreach (var trace in traces)
            {
                for (int i = 0; i < trace.Events.Count - 1; i++)
                {
                    string fromResource = trace.Events[i].Resource;
                    string toResource = trace.Events[i + 1].Resource;
                    if (resourceIndexMap.TryGetValue(fromResource, out int fromIndex) &&
                        resourceIndexMap.TryGetValue(toResource, out int toIndex))
                    {
                        HandoverMatrix[fromIndex, toIndex]++;
                    }
                }
            }
        }


    }
}
