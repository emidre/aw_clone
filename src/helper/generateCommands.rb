terrainDir = File.join(__dir__, '../models/playerObjects/terrainObjects/') 
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

open(File.join(__dir__, '../models/commands.ts') , 'w') do |f|
    f.puts "export default class Commands {\n"
    terrain.map { |name|
        f.puts "    static #{name.downcase} = \"#{name.downcase}\"\n"
    }
    buildings.map { |name|
        f.puts "    static #{name.downcase} = \"#{name.downcase}\"\n"
    }
    units.map { |name|
        f.puts "    static #{name.downcase} = \"#{name.downcase}\"\n"
    }

    f.puts "    static clear = \"clear\"\n"
    f.puts "    static selectedplayer = \"selectedplayer\"\n"

    f.puts "}"
end

open(File.join(__dir__, 'listOfCommands.txt') , 'w') do |f|
    terrain.map { |name|
        f.puts "            case Commands.#{name.downcase}: {\n"
        f.puts "                TileManager.Instance.currentBrush = #{name};\n"
        f.puts "                break;\n"
        f.puts "            }\n"
    }
    buildings.map { |name|
        f.puts "            case Commands.#{name.downcase}: {\n"
        f.puts "                TileManager.Instance.currentBrush = #{name};\n"
        f.puts "                break;\n"
        f.puts "            }\n"
    }
    units.map { |name|
        f.puts "            case Commands.#{name.downcase}: {\n"
        f.puts "                TileManager.Instance.currentBrush = #{name};\n"
        f.puts "                break;\n"
        f.puts "            }\n"
    }
end