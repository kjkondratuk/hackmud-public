export default (context: Context, args?: unknown) => {
    let {caller} = context
    const l = $fs.scripts.lib()
    const now = new Date()

    if(!args || args["usage"]) {
        return "user.cull\n" +
            "Param (applicable command): effect/examples\n" +
            " - usage (all) : only display this message\n" +
            " - rarity (all) : 0-5 rarity threshold - culls less common upgrades\n" +
            " - confirm (all) : set true to confirm destructive action"
    }

    if(!args || args["rarity"] === null || typeof args["rarity"] !== "number") {
        return {ok: false, err: "invalid rarity specified"}
    }

    const rarity = args["rarity"]

    let cull_list: Partial<Upgrade & { loaded: boolean }>[] = []

    for(let i = 0; i < rarity; i++) {
        // @ts-ignore
        const upg = $ms.sys.upgrades({filter: {rarity: i, loaded: false}})
        if(!upg.ok && !upg == null) {
            return upg
        }
        // @ts-ignore
        upg.forEach((c: Partial<UpgradeCore & Record<string, string | number | boolean>
            & { loaded: boolean }>) => cull_list.push(c))
    }

    let delete_performed = false
    if(args["confirm"] && cull_list.length > 0) {
        const res = $ns.sys.cull({i: cull_list.map((item) => item.i), confirm: true})
        if(!res.ok) {
            return res
        }
        delete_performed = true
    }

    // return cull_list
    return cull_list.length > 0 ? l.columnize(cull_list.map((item) => item.i+" : "+item.name))+"\n" +
        `Delete performed? ${delete_performed}` : `Delete performed? ${delete_performed}`
}