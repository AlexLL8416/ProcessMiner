namespace ProcessMiner.Core.Export;

using ProcessMiner.Core.Models;
using System.Text;

public class GraphvizExporter
{
    public static string ExportToDot(string[] activities, RelationshipType[,] footprintMatrix)
    {
        var sb = new StringBuilder();

        sb.AppendLine("digraph ProcessGraph {");
        sb.AppendLine("  rankdir=UD;");
        sb.AppendLine("  node [shape=box, style=filled, fillcolor=\"#f8f9fa\", color=\"#ced4da\", fontname=\"Helvetica\", margin=0.2];");
        sb.AppendLine("  edge [fontname=\"Helvetica\", fontsize=10];");
        sb.AppendLine();

        int n = activities.Length;

        // Nodes
        for (int i = 0; i < n; i++)
        {
            string label = activities[i].Replace("_", " ");
            sb.AppendLine($"  {i} [label=\"{label}\"];");
        }

        sb.AppendLine();

        // Edges
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                RelationshipType relation = footprintMatrix[i, j];

                if (relation == RelationshipType.Causal)
                {
                    sb.AppendLine($"  {i} -> {j} [color=\"#495057\"];");
                }
                else if (relation == RelationshipType.Concurrent && i < j)
                {
                    sb.AppendLine($"  {i} -> {j} [dir=both, style=dashed, color=\"#d63384\", label=\" ||\"];");
                }
            }
        }

        sb.AppendLine("}");
        return sb.ToString();
    }

    public static string ExportToDotWithPerformance(string[] activities, RelationshipType[,] footprintMatrix, TimeSpan[,] avgTimes, TimeSpan bottleneckThreshold, double[] avgActivityCosts, double costThreshold)
    {
        var sb = new StringBuilder();

        sb.AppendLine("digraph ProcessGraph {");
        sb.AppendLine("  rankdir=UD;");
        sb.AppendLine("  node [shape=box, style=filled, fillcolor=\"#f8f9fa\", color=\"#ced4da\", fontname=\"Helvetica\", margin=0.2];");
        sb.AppendLine("  edge [fontname=\"Helvetica\", fontsize=10];");
        sb.AppendLine();

        int n = activities.Length;

        // Nodes
        for (int i = 0; i < n; i++)
        {
            double cost = avgTimes != null ? avgActivityCosts[i] : 0; 
            string label = $"{activities[i].Replace("_", " ")}\\nCoste medio: {cost:F2}";

            // Si la tarea cuesta más de 20 euros, encendemos la alarma visual
            string fillColor = cost > costThreshold ? "#f8d7da" : "#f8f9fa";
            string borderColor = cost > costThreshold ? "#dc3545" : "#ced4da";

            sb.AppendLine($"  {i} [label=\"{label}\", fillcolor=\"{fillColor}\", color=\"{borderColor}\"];");
        }
        sb.AppendLine();

        // Edges with performance metrics
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                RelationshipType relation = footprintMatrix[i, j];
                TimeSpan avgTime = avgTimes[i, j];
                string timeLabel = FormatTimeSpan(avgTime);

                if (relation == RelationshipType.Causal)
                {
                    
                    // Determine edge color based on performance
                    if (avgTime > bottleneckThreshold)
                    {
                        // Bottleneck: Slow
                        sb.AppendLine($"  {i} -> {j} [label=\" {timeLabel}\", color=\"#dc3545\", fontcolor=\"#dc3545\", penwidth=2.0];");
                    }
                    else
                    {
                        // Normal: Fast
                        sb.AppendLine($"  {i} -> {j} [label=\" {timeLabel}\", color=\"#495057\"];");
                    }
                }
                else if (relation == RelationshipType.Concurrent && i < j)
                {
                    sb.AppendLine($"  {i} -> {j} [dir=both, style=dashed, color=\"#d63384\", label=\" ||  {timeLabel}\"];");
                }
            }
        }

        sb.AppendLine("}");
        return sb.ToString();
    }

    private static string FormatTimeSpan(TimeSpan timeSpan) 
    { 
    
        if (timeSpan.TotalDays > 1)
            return $"{(int)timeSpan.TotalDays}d {timeSpan.Hours}h {timeSpan.Minutes}m {timeSpan.Seconds}s";
        else if (timeSpan.TotalHours > 1)
            return $"{(int)timeSpan.TotalHours}h {timeSpan.Minutes}m {timeSpan.Seconds}s";
        else if (timeSpan.TotalMinutes > 1)
            return $"{(int)timeSpan.TotalMinutes}m {timeSpan.Seconds}s";
        else
            return $"{(int)timeSpan.TotalSeconds}s";
    }

    public static string ExportToDotSocialGraph(int[,] HandoverMatrix, string[] resources)
    {
        var sb = new StringBuilder();

        sb.AppendLine("digraph SocialGraph {");
        sb.AppendLine("  rankdir=UD;");
        sb.AppendLine("  node [shape=circle, style=filled, fillcolor=\"#f8f9fa\", color=\"#ced4da\", fontname=\"Helvetica\", margin=0.2];");
        sb.AppendLine("  edge [fontname=\"Helvetica\", fontsize=10];");
        sb.AppendLine();

        int n = HandoverMatrix.GetLength(0);

        // Nodes
        for (int i = 0; i < n; i++)
        {
            sb.AppendLine($"  {i} [label=\"{resources[i]}\"];");
        }
        sb.AppendLine();

        // Edges
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                if (HandoverMatrix[i, j] > 0)
                {
                    sb.AppendLine($"  {i} -> {j} [label=\"{HandoverMatrix[i, j]}\"];");
                }
            }
        }

        sb.AppendLine("}");
        return sb.ToString();
    }
}