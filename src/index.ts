import * as Discord from "discord.js";
import * as ConfigFile from "./config"
import { IBotCommand } from "./api";

const client: Discord.Client = new Discord.Client();

let commands: IBotCommand[] = [];

loadCommands(`${__dirname}/commands`)

client.on("ready", () => {

    //Lets you know that the bot is online
    console.log("Its Launched !!")
})

client.on("message", msg =>{

    //You should know this one
    if (msg.author.bot) { return;}

    //Ignore if the prefix is wrong OBVIOUSLY
    if(!msg.content.startsWith(ConfigFile.config.prefix)) { return; }

    //Handle the command
    handleCommand(msg);
})

async function handleCommand(msg: Discord.Message) {

    //Split string into the command and all args
    let command = msg.content.split(" ")[0].replace(ConfigFile.config.prefix, "");
    let args = msg.content.split(" ").slice(1);

    //Run through all of our commands
    for(const commandClass of commands){

        //Attempt to do code ready for error
        try{

            //Check if our command class is coorect
            if(!commandClass.isThisCommand(command)){

                //Go to the next command 
                continue;
            }

            //Pause execution whil we run the command
            await commandClass.runCommand(args, msg, client);
        }
        catch(exception){

            //If there is and error log it
            console.log(exception);
        }
    }
}

function loadCommands(commandsPath: string) {

    //No commands = leave
    if(!ConfigFile.config || (ConfigFile.config.commands as string[]).length === 0) { return; }

    //Loop through all of the commands
    for(const commandName of ConfigFile.config.commands as string[]) {

        const commandClass = require(`${commandsPath}/${commandName}`).default;

        const command = new commandClass() as IBotCommand;

        commands.push(command);
    }
}

client.login(ConfigFile.config.token);