// var person = {
// 	name: 'Kegham',
// 	age: 22
// };

// function updatePerson (obj) {
// 	// obj = {
// 	// 	name: 'Kegham',
// 	// 	age: 26
// 	// };
// 	obj.age = 26
// }
// updatePerson(person);
// console.log(person);

var grades = [57,88];

function getGrades (obj) {
	// obj = [57,88,69];
	// return obj;
	obj.push(69);
}

// grades = getGrades(grades);
getGrades(grades);
console.log(grades);