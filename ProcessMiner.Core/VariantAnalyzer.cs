using ProcessMiner.Core.Models;
using System.Collections.Generic;
using System.Linq;
using System;

namespace ProcessMiner.Core.Analysis
{
    public static class VariantAnalyzer
    {
        public static List<ProcessVariant> AnalyzeVariants(IEnumerable<Trace> traces, int topN = 5) 
        {
        
            var variantCounts = new Dictionary<string, int>();
            var variantDurations = new Dictionary<string, List<TimeSpan>>();
            var variantCosts = new Dictionary<string, List<double>>();
            int totalCases = 0;

            // Count the occurrences of each variant
            foreach (var trace in traces)
            {
                var signature = string.Join("->", trace.Events.Select(e => e.Activity));
                if (variantCounts.ContainsKey(signature))
                {
                    variantCounts[signature]++;
                    variantCosts[signature].Add(trace.Events.Sum(e => e.Cost));
                    variantDurations[signature].Add(trace.Events.Last().Timestamp - trace.Events.First().Timestamp);
                }
                else
                {
                    variantCounts[signature] = 1;
                    variantCosts[signature] = new List<double> { trace.Events.Sum(e => e.Cost) };
                    variantDurations[signature] = new List<TimeSpan> { trace.Events.Last().Timestamp - trace.Events.First().Timestamp };
                }
                totalCases++;
            }

            // Create a list of ProcessVariant objects with percentage calculations
            var result = variantCounts
                .Select(kvp => new ProcessVariant
                {
                    Signature = kvp.Key,
                    CaseCount = kvp.Value,
                    Percentage = (double)kvp.Value / totalCases * 100,
                    MeanDuration = TimeSpan.FromTicks((long)variantDurations[kvp.Key].Average(d => d.Ticks)),
                    MeanCost = variantCosts[kvp.Key].Average()
                })
                .OrderByDescending(v => v.CaseCount)
                .Take(topN)
                .ToList();
            return result;

        }

        public static string printVariants(List<ProcessVariant> variants)
        {
            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"Top {variants.Count} Variants:");
            for(int i = 0; i < variants.Count; i++)
            {
                var variant = variants[i];
                sb.AppendLine($"#{i+1} ({variant.Percentage:F2}% | {variant.CaseCount:N0} cases)");
                sb.AppendLine($"  Signature: {variant.Signature}");
                sb.AppendLine($"  Mean Duration: {variant.MeanDuration} | Mean Cost: {variant.MeanCost:F2}");
            }
            return sb.ToString();
        }

    }
}
