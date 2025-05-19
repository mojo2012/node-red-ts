/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const questions = [
	{ key: 'inputName', question: 'Node name (eg. MyCoolNode): ' },
	{ key: 'category', question: 'Category (eg. function, network, ...): ' },
	{ key: 'color', question: 'Node color (eg. #1eb3fd): ' },
];

const answers = {};

function askNext(i) {
	if (i < questions.length) {
		rl.question(questions[i].question, (answer) => {
			answers[questions[i].key] = answer.trim();
			askNext(i + 1);
		});
	} else {

		const projectRoot = process.cwd();
		const nodesDir = path.join(projectRoot, 'src', 'nodes');

		fs.mkdirSync(nodesDir, { recursive: true });

		const className = answers.inputName.replace(/[^a-zA-Z0-9]/g, '');
		const destTs = path.join(nodesDir, `${className}.ts`);
		const destHtml = path.join(nodesDir, `${className}.html`);

		const tsTemplate = fs.readFileSync(path.join(__dirname, 'templates/NodeTemplate.ts'), 'utf-8')
			.replace(/__NODE_CLASS__/g, className)
			.replace(/__NODE_NAME__/g, answers.inputName);

		const htmlTemplate = fs.readFileSync(path.join(__dirname, 'templates/NodeTemplate.html'), 'utf-8')
			.replace(/__NODE_CLASS__/g, className)
			.replace(/__NODE_NAME__/g, answers.inputName)
			.replace(/__CATEGORY__/g, answers.category)
			.replace(/__COLOR__/g, answers.color);

		fs.writeFileSync(destTs, tsTemplate);
		fs.writeFileSync(destHtml, htmlTemplate);

		// register type in package.json
		const packageJsonPath = path.join(projectRoot, 'package.json');
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

		if (!packageJson['node-red']) {
			packageJson['node-red'] = { nodes: {} };
		} else if (!packageJson['node-red'].nodes) {
			packageJson['node-red'].nodes = {};
		}

		packageJson['node-red'].nodes[className] = `nodes/${className}.js`;

		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
		console.log('✅ Registered node in package.json');

		console.log(`✅ Node ${className} created in src/nodes`);
		rl.close();
	}
}

askNext(0);
