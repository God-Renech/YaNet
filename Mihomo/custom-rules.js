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

const taiwanPattern = /台湾|台灣|🇹🇼|taiwan|tai wan/i
const taiwanIcon = 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png'

function reclassifyTaiwanNodes(config) {
  const groups = Array.isArray(config?.['proxy-groups']) ? config['proxy-groups'] : []
  const mainlandGroup = groups.find((group) => group?.name === 'CN中国大陆')
  if (!mainlandGroup || !Array.isArray(mainlandGroup.proxies)) return

  const taiwanNodes = mainlandGroup.proxies.filter(
    (proxyName) => typeof proxyName === 'string' && taiwanPattern.test(proxyName)
  )
  if (taiwanNodes.length === 0) return

  mainlandGroup.proxies = mainlandGroup.proxies.filter(
    (proxyName) => !taiwanNodes.includes(proxyName)
  )

  let taiwanGroup = groups.find((group) => group?.name === 'TW台湾省')
  if (taiwanGroup) {
    taiwanGroup.proxies = [...new Set([...(taiwanGroup.proxies || []), ...taiwanNodes])]
  } else {
    taiwanGroup = {
      ...mainlandGroup,
      name: 'TW台湾省',
      icon: taiwanIcon,
      proxies: taiwanNodes,
    }
    groups.push(taiwanGroup)
  }

  const mainlandIsEmpty = mainlandGroup.proxies.length === 0
  for (const group of groups) {
    if (group === taiwanGroup || !Array.isArray(group?.proxies)) continue
    const mainlandIndex = group.proxies.indexOf('CN中国大陆')
    if (mainlandIndex !== -1) {
      if (!group.proxies.includes('TW台湾省')) {
        group.proxies.splice(mainlandIndex + 1, 0, 'TW台湾省')
      }
      if (mainlandIsEmpty) {
        group.proxies = group.proxies.filter((name) => name !== 'CN中国大陆')
      }
    }
  }

  if (mainlandIsEmpty) {
    const mainlandIndex = groups.indexOf(mainlandGroup)
    if (mainlandIndex !== -1) groups.splice(mainlandIndex, 1)
  }
}

function main(config) {
  const groups = Array.isArray(config?.['proxy-groups']) ? config['proxy-groups'] : []
  const hasDefaultNode = groups.some((group) => group?.name === '默认节点')
  const bilibiliPolicy = hasDefaultNode ? '默认节点' : 'DIRECT'
  const domesticPolicy = hasDefaultNode ? '默认节点' : 'DIRECT'
  const bilibiliRule = `GEOSITE,bilibili,${bilibiliPolicy}`
  const customRules = [
    ...adobeBlockRules,
    bilibiliRule,
    ...directRules,
    `DOMAIN-SUFFIX,ip138.com,${domesticPolicy}`,
    `DOMAIN-SUFFIX,ip.cn,${domesticPolicy}`,
    `GEOSITE,geolocation-cn,${domesticPolicy}`,
    `DOMAIN-SUFFIX,cn,${domesticPolicy}`,
    `GEOSITE,cn,${domesticPolicy}`,
    `GEOIP,cn,${domesticPolicy}`,
  ]
  const existingRules = Array.isArray(config?.rules) ? config.rules : []
  const existingSet = new Set(existingRules)

  config.rules = [
    ...customRules.filter((rule) => !existingSet.has(rule)),
    ...existingRules,
  ]

  reclassifyTaiwanNodes(config)

  return config
}

globalThis.main = main
