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
}