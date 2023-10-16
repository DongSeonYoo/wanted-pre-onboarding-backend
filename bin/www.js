const app = require("../server");
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`${PORT}번에서 실행합미당`);
});
