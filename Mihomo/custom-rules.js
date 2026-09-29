/**
 * Personal routing rules for Mihomo.
 * Apply this script after the main YaNet override script.
 */

const directRules = [
  'DOMAIN-SUFFIX,siliconflow.cn,DIRECT',
  'DOMAIN-SUFFIX,siliconflow.com,DIRECT',
  'DOMAIN,kivo.wiki,DIRECT',
  'DOMAIN-SUFFIX,kivo.wiki,DIRECT',
  'DOMAIN-SUFFIX,tokenrhythm,DIRECT',
  'DOMAIN,tokenrhythm,DIRECT',
  'DOMAIN,steampy.com,DIRECT',
  'DOMAIN-SUFFIX,steampy.com,DIRECT',
  'DOMAIN,media.st.dl.eccdnx.com,DIRECT',
  'DOMAIN-SUFFIX,st.dl.eccdnx.com,DIRECT',
]

const adobeBlockRules = [
  'DOMAIN-SUFFIX,ic.adobe.io,REJECT-DROP',
  'DOMAIN-REGEX,\\w{10}\\.adobe\\.io,REJECT-DROP',
  'DOMAIN-REGEX,\\w{10}\\.adobestats\\.io,REJECT-DROP',
]

function main(config) {
  const groups = Array.isArray(config?.['proxy-groups']) ? config['proxy-groups'] : []
  const hasDefaultNode = groups.some((group) => group?.name === '默认节点')
  const bilibiliPolicy = hasDefaultNode ? '默认节点' : 'DIRECT'
  const bilibiliRule = `GEOSITE,bilibili,${bilibiliPolicy}`
  const customRules = [...adobeBlockRules, bilibiliRule, ...directRules]
  const existingRules = Array.isArray(config?.rules) ? config.rules : []
  const existingSet = new Set(existingRules)

  config.rules = [
    ...customRules.filter((rule) => !existingSet.has(rule)),
    ...existingRules,
  ]

  return config
}

globalThis.main = main
