using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProcessMiner.Api.Models;
using ProcessMiner.Core;
using ProcessMiner.Core.Algorithms;
using ProcessMiner.Core.Analysis;
using ProcessMiner.Core.Data;
using ProcessMiner.Core.Export;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq; // Necesario para usar SelectMany, GroupBy, etc.
using System.Threading.Tasks;

namespace ProcessMiner.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MinerController : ControllerBase
    {
        [HttpPost("upload")]
        [RequestSizeLimit(200_000_000)]
        public async Task<IActionResult> UploadLog(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se ha enviado ningún archivo.");

            var tempPath = Path.GetTempFileName();
            try
            {
                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Execute Core
                var traces = CsvParser.ParseAndOrdering(tempPath);

                var heuristicMiner = new HeuristicMiner(traces);
                var alphaMiner = new AlphaMiner(traces);
                var resourceMiner = new ResourceMining(traces);
                var topVariants = VariantAnalyzer.AnalyzeVariants(traces, 5);

                var allEvents = traces.SelectMany(t => t.Events).ToList();

                var topResource = allEvents
                    .Where(e => !string.IsNullOrEmpty(e.Resource))
                    .GroupBy(e => e.Resource)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .FirstOrDefault() ?? "N/A";

                var eventsOverTime = allEvents
                    .GroupBy(e => e.Timestamp.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new TimeSeriePoint
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Value = g.Count()
                    }).ToList();

                var costOverTime = allEvents
                    .GroupBy(e => e.Timestamp.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new TimeSeriePoint
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Value = (double)g.Sum(e => e.Cost) 
                    }).ToList();

                var dependencyRows = new List<MatrixRow>();
                var concurrencyRows = new List<MatrixRow>();
                var activitiesList = new List<string>(heuristicMiner.Activities);
                int n = heuristicMiner.Activities.Length;

                for (int i = 0; i < n; i++)
                {
                    var depValues = new List<double>();
                    var concValues = new List<double>();

                    for (int j = 0; j < n; j++)
                    {
                        depValues.Add(heuristicMiner.DependencyMatrix[i, j]);
                        concValues.Add(heuristicMiner.ConcurrencyMatrix[i, j]);
                    }

                    dependencyRows.Add(new MatrixRow { ActivityName = activitiesList[i], Values = depValues });
                    concurrencyRows.Add(new MatrixRow { ActivityName = activitiesList[i], Values = concValues });
                }

                // Build the full JSON response
                var response = new MiningResponse
                {
                    HeuristicGraphDot = GraphvizExporter.ExportToDotHeursiticMiner(0.8, 0.8, heuristicMiner.Activities, heuristicMiner.DependencyMatrix, heuristicMiner.ConcurrencyMatrix, heuristicMiner.DirectSuccessionMatrix),
                    AlphaGraphDot = GraphvizExporter.ExportToDotWithPerformance(alphaMiner.Activities, alphaMiner.FootprintMatrix, alphaMiner.AverageTrasitionTime, TimeSpan.FromHours(1), alphaMiner.AverageActivityCost, 20.0),
                    SocialGraphDot = GraphvizExporter.ExportToDotSocialGraph(resourceMiner.HandoverMatrix, resourceMiner.Resources),
                    TopVariants = topVariants,

                    // Matrix
                    Activities = activitiesList,
                    DependencyMatrix = dependencyRows,
                    ConcurrencyMatrix = concurrencyRows,

                    // Dashboard Data
                    Dashboard = new GlobalStats
                    {
                        TotalCases = traces.Count(),
                        TotalEvents = allEvents.Count,
                        UniqueActivities = heuristicMiner.Activities.Length,
                        UniqueResources = resourceMiner.Resources.Length,
                        TopResource = topResource,
                        CostOverTime = costOverTime,
                        EventsOverTime = eventsOverTime
                    }
                };

                return Ok(response);
            }
            finally
            {
                if (System.IO.File.Exists(tempPath))
                {
                    System.IO.File.Delete(tempPath);
                }
            }
        }
    }
}