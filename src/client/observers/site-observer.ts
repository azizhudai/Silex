import * as objectPath from '../../../node_modules/object-path/index.js';
import { SiteData, DataSources } from '../../types';
import { getSiteDocument } from '../components/UiElements';
import { setDescription, setDescriptionSocial, setEnableMobile, setFaviconPath, setFonts, setHeadScript, setHeadStyle, setLang, setThumbnailSocialPath, setTitle, setTitleSocial, setTwitterSocial, setWebsiteWidth } from '../dom/site-dom';
import { SilexNotification } from '../utils/Notification';

export function onChangeSite(prev: SiteData, site: SiteData) {
  console.log('site changed', prev, site)
  const doc = getSiteDocument()
  if (!prev || prev.headStyle !== site.headStyle) { setHeadStyle(doc, site.headStyle) }
  if (!prev || prev.headScript !== site.headScript) { setHeadScript(doc, site.headScript) }
  if (!prev || prev.title !== site.title) { setTitle(doc, site.title) }
  if (!prev || prev.description !== site.description) { setDescription(doc, site.description) }
  if (!prev || prev.enableMobile !== site.enableMobile) { setEnableMobile(doc, site.enableMobile) }
  if (!prev || prev.faviconPath !== site.faviconPath) { setFaviconPath(doc, site.faviconPath) }
  if (!prev || prev.thumbnailSocialPath !== site.thumbnailSocialPath) { setThumbnailSocialPath(doc, site.thumbnailSocialPath) }
  if (!prev || prev.descriptionSocial !== site.descriptionSocial) { setDescriptionSocial(doc, site.descriptionSocial) }
  if (!prev || prev.titleSocial !== site.titleSocial) { setTitleSocial(doc, site.titleSocial) }
  if (!prev || prev.lang !== site.lang) { setLang(doc, site.lang) }
  if (!prev || prev.width !== site.width) { setWebsiteWidth(doc, site.width) }
  if (!prev || prev.twitterSocial !== site.twitterSocial) { setTwitterSocial(doc, site.twitterSocial) }
  if (!prev || prev.dataSources !== site.dataSources) { loadDataSources(site.dataSources, true) }
  if (!prev || prev.fonts !== site.fonts) { setFonts(doc, site.fonts) }
}

async function loadDataSources(dataSources: DataSources, reload): Promise<DataSources> {
  try {
    const dataSourcesClone = { ...dataSources };
    return (await Promise.all(Object.keys(dataSourcesClone).map(async (name) => {
      const dataSource = dataSourcesClone[name];
      if (reload || !dataSource.data || !dataSource.structure) {
        const res = await fetch(dataSource.href);
        const data = await res.json();
        const root = objectPath.get(data, dataSource.root);
        const first = objectPath.get(root, '0');
        dataSource.data = data;
        dataSource.structure = {};
        if (first) {
          Object.keys(first).forEach((key) => dataSource.structure[key] = getDataSourceType(first[key]));
        }
        return {name, dataSource};
      }
    }))).reduce((prev, cur) => prev[cur.name] = cur.dataSource, {});
  } catch (err) {
    console.error('could not load data sources', err);
    SilexNotification.alert('Error', `There was an error loading the data sources: ${err}`, () => { throw err; });
  }
}
function getDataSourceType(value) {
  return Array.isArray(value) ? 'array' : typeof(value);
}
