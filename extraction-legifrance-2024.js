// Script d'extraction des taux AT/MP à partir de la page web Legifrance du décret
// de publication des taux.
// A exécuter (copier/coller) dans la console du navigateur sur la page Legifrance.
// https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042731279
// Le script retourne un fichier json à télécharger.

let fileName = "taux-2024.json";

// 🚨 Vérifier qu'il s'agit bien du bon tableau
let risquesTable = document.querySelector(".summary-preface table");

let rows = [...risquesTable.querySelectorAll("tr")];
let reducer = (acc, row) => {
	let cells = row.querySelectorAll("td");
	if (cells.length === 1) {
		// On dénormalize l'en-tête (ligne avec une seule case)
		return {
			...acc,
			currentHeader: cells[0].textContent.trim() || acc.currentHeader,
		};
	} else if (cells.length === 4) {
		// On récupère les 3 cases + la dernière en-tête
		let res =
			acc.res +
			JSON.stringify({
				"Nature du risque": cells[0].textContent.replace(/ \([0-9]\)/g, "").trim(),
				"Code risque": cells[1].textContent.trim(),
				"Taux net": cells[2].textContent.trim(),
				Catégorie: acc.currentHeader,
			}) +
			",\n";
		return { ...acc, res };
	} else {
		// On ignore les autres lignes
		return acc;
	}
};
let flatJson = rows
	.reduce(reducer, { currentHeader: null, res: "" })
	//On retire la dernière virgule pour validité json
	.res.replace(/,\n$/, "\n");

// https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
let encodedUri = encodeURI(`data:text/json;charset=utf-8,[\n${flatJson}]\n`);
let link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", fileName);
link.click();
