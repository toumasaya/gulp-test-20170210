import Person from "./person";

let person = new Person("Luffy", "Wang");

document.getElementById("nameSpan").innerHTML = person.getFirstName() + " " + person.getLastName();
