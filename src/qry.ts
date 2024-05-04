
export default (context: Context, args?: unknown) => { // usage:true
    let {caller} = context
    const l = $fs.scripts.lib()

    if(args && args["usage"]) {
        return "user.qry\n" +
            "Params:\n" +
            " - command (all) : insert, update, delete\n" +
            " - query (select, delete) : {key: value}\n" +
            " - data (insert) : {key: value} or [{key: value}, {key: value}]\n"
    }

    const cmd = args["command"]
    const query = args["query"]
    const data = args["data"]

    // Validate command has been specified
    if(cmd === null || typeof(cmd) !== "string") {
        return {ok: false, err: "command must be specified and must be a string"}
    }

    // validate args required by select/delete
    if((cmd === "select" || cmd === "delete")
        && (query === null || typeof(query) !== "object")) {
        return {ok: false, err: "query must be specified and must be an object"}
    }

    // validate args required for insert
    if((cmd === "insert")
        && !(data !== null && (!isArrayofObjects(data) || typeof data !== "object"))) {
        return {ok: false, err: "data must be a Array"}
    }

    switch(cmd) {
        case "select":
            const c = $db.f(args["query"])
            c.each((doc) => $D(doc))
            c.close()
            break
        case "insert":
            $D(data)
            const ir = $db.i(data)
            if(!ir.ok) {
                return ir
            }
            break
        case "delete":
            const dr = $db.r(query)
            if(!dr.ok) {
                return dr
            }
            break
        default:
            return {ok: false, err: "invalid command: valid commands are select, insert, or delete"}
    }
}

function isArrayofObjects(value: any): value is object[] {
    // Check if the value is an array
    if (!Array.isArray(value)) {
        return false;
    }
    // Check if every element in the array is an object
    return value.every(item => typeof item === 'object' && item !== null);
}