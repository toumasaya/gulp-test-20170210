import Person from "./person";

let person = new Person("Luffy", "eeee");

document.getElementById("nameSpan").innerHTML = person.getFirstName() + " " + person.getLastName();
