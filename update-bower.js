var git = require("simple-git"),
	fsSync = require("fs-sync"),
	del = require("del");

var argv = require("minimist")(process.argv.slice(2));

var sourceDir = __dirname + "/target/next";
var repoDir = __dirname + "/tmp-git";
var bowerJsonTplFile  = __dirname + "/bower.json.tpl";

var gitUsername, gitPassword, libVersion;

if(argv.hasOwnProperty("u") && argv.hasOwnProperty("p") && argv.hasOwnProperty("v")) {
	gitUsername = argv.u;
	gitPassword = argv.p;
	libVersion = argv.v;

	var remoteOrigin = "https://" +
		gitUsername + ":" +
		gitPassword +
		//"@github.com/NeXt-UI/next-bower.git";
		"@github.com/zverevalexei/export-test.git";

	git()
		// delete & pull down
		.then(function(){

			// delete old files if exist
			console.log("Deleting old files if exist...");
			del.sync(repoDir + "**", {force: true});

			console.log("Cloning the repo from origin...");
		})
		.clone(remoteOrigin, repoDir)
		.then(function(){
			git(repoDir)
			// clean & copy in
			.then(function(){
				console.log("Removing all files except '.git' directory...");

				del.sync([
					repoDir + "/**",
					"!" + repoDir + "/.git",
					"!" + repoDir
				], {force: true});

				console.log("Copying build files for commit...");
				fsSync.copy(sourceDir, repoDir);

				console.log("Creating bower.json file...");
				if(fsSync.exists(bowerJsonTplFile)){
					var bowerJsonContent = fsSync.read(bowerJsonTplFile).replace(/{{version}}/gi, libVersion);
					fsSync.write(repoDir + "/bower.json", bowerJsonContent);
				}

			})

			// add to git
				.then(function(){
					console.log("Adding all files to git...");
				})
				.add('.')

				// commit
				.then(function(){
					console.log("Committing...");
				})
				.commit("Update NeXt - version " + libVersion)

				// add origin
				.then(function(){
					console.log("Adding remote origin...");
				})
				.removeRemote("origin")
				.addRemote("origin", remoteOrigin)

				// push
				.then(function(){
					console.log("Pushing...");
				})
				.push("origin", "master")

				.then(function(){

					console.log("Deleting temporary directory...");
					// delete
					del.sync(repoDir + "/**", {force: true});
					console.log("Done!");
				});
		});

}
else{
	console.error("Please specify username (-u) and password (-p) for Git, as well as the new NeXt version (-v)\n" +
		"Example: node update-bower.js -u master -p qwerty123 -v 0.1");
}
