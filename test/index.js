const differ = require("../dist/index");


const difference = new differ.Differ({ name: "token", props: ["name"] }).getfullDifference(
    {
        email: "klmd",
        token: [
            { name: "123", key: "abc" },
            { name: "12345", key: "old Key" },
            { name: "1236", desc: "No token available" }
        ]
    },
    {
        email: "klm",
        token: [
            { name: "123", key: "abc" },
            { name: "1234", key: "New Key" },
            { name: "1236", desc: "No token available" }
        ]
    }
);
console.log("DIFFERENCE");
console.log("*****************");
for (const key in difference) {
    if (difference.hasOwnProperty(key)) {
        const element = difference[key];
        console.log("");
        console.log(key.toUpperCase());
        console.log("-------");
        console.log(JSON.stringify(element));
    }
}
console.log("*******XXX*******");