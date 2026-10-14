import { env } from "$env/dynamic/private";
import type { PageServerLoad } from "./$types";
const XORdecrypt = (textInp: string) => {
    const tb = Buffer.from(textInp, 'base64');
    const kb = Buffer.from(env.USERID_ENCRYPTION_KEY ?? "", "hex");
    const out = Buffer.alloc(tb.length)

    for (let i = 0; i < tb.length; i++) {
        out[i] = tb[i] ^ kb[i % kb.length]
    }
    return out.toString('utf-8');
}
// A referral code decodes to "<user id> <slack id>". Anything else (truncated links, junk) is invalid, never a crash.
const verifyReferCode: (code: string) => boolean = (code: string) => {
    if (code === "") {
        return false
    }
    const parts = XORdecrypt(code).split(' ')
    if (parts.length !== 2) {
        return false
    }
    const [userId, slackId] = parts
    if (!userId || !slackId || !slackId.startsWith("U") || userId.startsWith("ident!")) {
        return false
    }
    return true
}

export const load: PageServerLoad = async ({ url, cookies }) => {
    let refer = url.searchParams.get("refer") || null
    const valid = verifyReferCode(refer || "")
    if (refer && !valid) {
        return {
            error: "Invalid referral code."
        }
    }
    if (refer != null && valid) {
        cookies.set("refer", refer, { maxAge: 60 * 60 * 24 * 10, path: "/" })

    }

}
