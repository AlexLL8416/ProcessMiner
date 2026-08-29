# 1. Lightweight base image to run the application on the server (Render)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
# .NET 8 uses port 8080 by default inside the container
EXPOSE 8080 
ENV ASPNETCORE_HTTP_PORTS=8080

ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

# 2. Heavy environment with the SDK to compile the code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy only the .csproj files first to restore dependencies.
# This leverages Docker cache and makes builds faster.
COPY ["ProcessMiner.Api/ProcessMiner.Api.csproj", "ProcessMiner.Api/"]
COPY ["ProcessMiner.Core/ProcessMiner.Core.csproj", "ProcessMiner.Core/"]

# Restore API dependencies (which will also pull Core dependencies)
RUN dotnet restore "ProcessMiner.Api/ProcessMiner.Api.csproj"

# Now copy the rest of the source code to the image
COPY . .

# Move to the API folder and build it in Release mode
WORKDIR "/src/ProcessMiner.Api"
RUN dotnet build "ProcessMiner.Api.csproj" -c Release -o /app/build

# 3. Publish the optimized binaries
FROM build AS publish
RUN dotnet publish "ProcessMiner.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 4. Build the final image by copying only the published output to the lightweight base
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Server startup command
ENTRYPOINT ["dotnet", "ProcessMiner.Api.dll"]