import {PUBLIC_HACKCLUB_AUTH, PUBLIC_HACKCLUB_REDIRECT} from "$env/static/public"
import { redirect } from "@sveltejs/kit"
import {scopes} from "$lib/utils"
import type {PageServerLoad} from "./$types"
import crypto from "crypto"
export const load = ({cookies}) => {
    const state = crypto.randomBytes(16).toString("hex")
    cookies.set("oauth_state", state, {path: "/", httpOnly: true, sameSite: "strict", secure: true, maxAge: 300})
    const url = "https://auth.hackclub.com/oauth/authorize?client_id=" + PUBLIC_HACKCLUB_AUTH + "&redirect_uri=" + PUBLIC_HACKCLUB_REDIRECT + "&response_type=code&scope=" + scopes + "&state=" + state
    return redirect(308, url)
}