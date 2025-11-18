import copy from 'copy-to-clipboard';

// dynemic page load for homepage and members page
export const header_menu = {
    HOMEPAGE: "home",
    MEMBERS_PAGE: "members"
}

export const CopyToClipboard = (copyText: any) => {
    copy(copyText)
}

export const capitalize = (string: any) => {
    return string?.split(' ')?.map((word: any) =>
        word?.charAt(0)?.toUpperCase() + word?.slice(1)
    ).join(' ')
}

export const showFullContent = (string: any, char: number) => {
    return string?.length > char ? string?.slice(0, char)?.replace(/\n/g, "<br />") + "..." : string?.replace(/\n/g, "<br />")
}