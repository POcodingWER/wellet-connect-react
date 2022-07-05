import Main from './views/Main.svelte';
import KIP17Deploy from './views/KIP17Deploy.svelte';
import WhitelistDeploy from './views/WhitelistDeploy.svelte';
import Whitelist from './views/Whitelist.svelte';
import MinterDeploy from './views/MinterDeploy.svelte';
import NFTList from './views/Airdrop.svelte';
import Unpack from './views/Unpack.svelte';

export default {
  '/': Main,
  '/whitelist': Whitelist,
  '/kip17-deploy': KIP17Deploy,
  '/whitelist-deploy': WhitelistDeploy,
  '/minter-deploy/:nftToken/:whiteListContract': MinterDeploy,
  '/airdrop': NFTList,
  '/unpack': Unpack
}