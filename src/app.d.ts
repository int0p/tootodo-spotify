// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
    // interface Locals {}
    interface PageData {
        user: SpotifyApi.CurrentUsersProfileResponse | null;
        title?: string;
        color?: string | null;
    }
    // interface Error {}
    // interface Platform {}
}

declare interface Window {
    refreshPromise: Promise<Response> | null;
}
