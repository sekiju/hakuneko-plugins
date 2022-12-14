import Connector from 'hakuneko://cache/mjs/engine/Connector.mjs';
import Manga from 'hakuneko://cache/mjs/engine/Manga.mjs';

/**
 * Author: Sekiju
 * Version: 1.0 (August 4, 2022)
 * URL: https://github.com/sekiju/hakuneko-plugins
 *
 * Installation:
 *   Place all files into your plugin directory, guide: https://github.com/manga-download/hakuneko/wiki/User-Manual#directories
*/

export default class CubariMoe extends Connector {

    constructor() {
        super();
        super.id = 'cubari-moe-plugin';
        super.label = 'Cubari Plugin';
        this.tags = ['manga'];
        this.url = 'https://cubari.moe';
        this.api = 'https://cubari.moe/read/api';
    }

    get icon() {
        return 'hakuneko://plugins/CubariMoe.png';
    }

    async _getMangaFromURI(uri) {
        const urlComponents = uri.pathname.split('/');
        const source = urlComponents[2], slug = urlComponents[3];

        const url = new URL(this.api + `/${source}/series/${slug}`);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);

        return new Manga(this, `${source}_${slug}`, data.title);
    }

    async _getMangas() {
        const msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const urlComponents = manga.id.split('_');
        const source = urlComponents[0], slug = urlComponents[1];

        const request = new Request(new URL(this.api + `/${source}/series/${slug}`), this.requestOptions);
        const { chapters } = await this.fetchJSON(request);

        return Object.keys(chapters).map(key => {
            return {
                id: `${manga.id}_${key}`,
                title: chapters[key].title,
            };
        });
    }

    async _getPages(chapter) {
        const urlComponents = chapter.id.split('_');
        const source = urlComponents[0], slug = urlComponents[1], chapterId = urlComponents[2];

        const request = new Request(new URL(this.api + `/${source}/series/${slug}`), this.requestOptions);
        const { chapters } = await this.fetchJSON(request);

        const pages = Object.values(chapters[chapterId].groups)[0];
        return pages.map(page => this.createConnectorURI(page.src || page));
    }
}