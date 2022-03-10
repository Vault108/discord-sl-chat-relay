# SL Discord Relay Bot

A Discord and Second Life bot capable of relaying messages between inworld Second Life Groups, and Discord Channels, supports (theoretically) as many groups as the second life allows(42 for normal accounts, 70 for premium). This has not been tested with more than 10 groups, your available memory is also a limitation. 



## Install 

- Clone a copy of the repository to your machine 
- Run npm install on the folder
- Copy .env and config.js example files to .env and config.js
- Insert the Discord Bot Token and Second Life Login Info in .env
- Insert the Mapping of SL Groups to Discord Channels in config.js


```bash
git clone github.com/redrobotsl/sl-discord-relay.git
npm install --no-dev
cp .env-example .env
cp config.js.example config.js
```


## Todo
- Add Region Restart Evasion with Fallback Regions in the Config File
- Cleanup Code and add sufficient comments. 
- Add Reload Capability of SL and Discord Commands/Event files. 



## License

Licensed under the MIT License.

## Credits

- CasperTech for their implementation of the OMV Protocol and Client in Node. https://github.com/CasperTech/node-metaverse
- The Creators of the Guidebot Discord Bot. 
