terrainDir = File.join(__dir__, '../models/terrainObjects/') 
buildingDir = File.join(__dir__, '../models/playerObjects/buildingObjects/')
unitDir = File.join(__dir__, '../models/playerObjects/unitObjects/')

terrain = []
buildings = []
units = []

Dir.foreach(terrainDir) do |file|
    next if !file.end_with?(".ts") 
    File.read(terrainDir + file).match(/class ([^\s-]+) /) { |m| terrain.push(*m.captures) }
end

Dir.foreach(buildingDir) do |file|
    next if !file.end_with?(".ts") 
    File.read(buildingDir + file).match(/class ([^\s-]+) /) { |m| buildings.push(*m.captures) }
end

Dir.foreach(unitDir) do |file|
    next if !file.end_with?(".ts") 
    File.read(unitDir + file).match(/class ([^\s-]+) /) { |m| units.push(*m.captures) }
end

open(File.join(__dir__, '../setGameObjectDefaultInstances.ts') , 'w') do |f|
    f.puts "import Constants from \"./constants\"\n"
    terrain.map { |name|
        f.puts "import #{name} from \"./models/terrainObjects/#{name}\"\n"
    }
    buildings.map { |name|
        f.puts "import #{name} from \"./models/playerObjects/buildingObjects/#{name}\"\n"
    }
    units.map { |name|
        f.puts "import #{name} from \"./models/playerObjects/unitObjects/#{name}\"\n"
    }
    f.puts "\n"

    f.puts "export const setGameObjectDefaultInstances = () => {\n"
    terrain.map { |name|
        f.puts "    Constants.gameObjectDefaultInstances.set(#{name}, new #{name}())\n"
    }
    buildings.map { |name|
        f.puts "    Constants.gameObjectDefaultInstances.set(#{name}, new #{name}())\n"
    }
    units.map { |name|
        f.puts "    Constants.gameObjectDefaultInstances.set(#{name}, new #{name}())\n"
    }
    f.puts "}"
end