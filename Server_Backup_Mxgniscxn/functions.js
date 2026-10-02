const axios = require('axios');
const chalk = require('chalk');

const BASE = 'https://discord.com/api/v10';

function api(token) {
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: token },
  });
}

async function req(fn) {
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (e.response?.status === 429) {
        const wait = (e.response.data.retry_after || 1) * 1000;
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw e;
      }
    }
  }
}

class Clone {
  static async rolSil(token, guildId) {
    console.log(chalk.yellow('[~] Roller siliniyor...\n'));
    const http = api(token);
    const { data: roles } = await req(() => http.get(`/guilds/${guildId}/roles`));
    let silinen = 0;
    for (const role of roles) {
      if (role.name === '@everyone' || role.managed) continue;
      try {
        await req(() => http.delete(`/guilds/${guildId}/roles/${role.id}`));
        console.log(chalk.red(`[x] ..... ${role.name} - Rol silindi`));
        silinen++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${role.name} - Silinemedi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${silinen} rol silindi.\n`));
  }

  static async rolOlustur(token, guildToId, guildFromId) {
    console.log(chalk.yellow('[~] Roller olusturuluyor...\n'));
    const http = api(token);
    const { data: roles } = await req(() => http.get(`/guilds/${guildFromId}/roles`));
    let olusturulan = 0;
    const filtered = roles
      .filter(r => r.name !== '@everyone' && !r.managed)
      .sort((a, b) => b.position - a.position);
    for (const role of filtered) {
      try {
        await req(() => http.post(`/guilds/${guildToId}/roles`, {
          name: role.name,
          permissions: role.permissions,
          color: role.color,
          hoist: role.hoist,
          mentionable: role.mentionable,
        }));
        console.log(chalk.green(`[+] ..... ${role.name} - Rol olusturuldu`));
        olusturulan++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${role.name} - Olusturulamadi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${olusturulan} rol olusturuldu.\n`));
  }

  static async kanalSil(token, guildId) {
    console.log(chalk.yellow('[~] Kanallar siliniyor...\n'));
    const http = api(token);
    const { data: channels } = await req(() => http.get(`/guilds/${guildId}/channels`));
    let silinen = 0;
    for (const ch of channels) {
      try {
        await req(() => http.delete(`/channels/${ch.id}`));
        console.log(chalk.red(`[x] ..... ${ch.name} - Kanal silindi`));
        silinen++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${ch.name} - Silinemedi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${silinen} kanal silindi.\n`));
  }

  static async kategoriOlustur(token, guildToId, guildFromId) {
    console.log(chalk.yellow('[~] Kategoriler olusturuluyor...\n'));
    const http = api(token);
    const { data: channels } = await req(() => http.get(`/guilds/${guildFromId}/channels`));
    const { data: toRoles } = await req(() => http.get(`/guilds/${guildToId}/roles`));
    const { data: fromRoles } = await req(() => http.get(`/guilds/${guildFromId}/roles`));
    const kategoriler = channels.filter(c => c.type === 4).sort((a, b) => a.position - b.position);
    let olusturulan = 0;
    const kategoriMap = {};
    for (const kat of kategoriler) {
      try {
        const permission_overwrites = (kat.permission_overwrites || []).map(ow => {
          const fromRole = fromRoles.find(r => r.id === ow.id);
          if (!fromRole) return null;
          const toRole = toRoles.find(r => r.name === fromRole.name);
          if (!toRole) return null;
          return { id: toRole.id, type: ow.type, allow: ow.allow, deny: ow.deny };
        }).filter(Boolean);
        const { data: newKat } = await req(() => http.post(`/guilds/${guildToId}/channels`, {
          name: kat.name, type: 4, position: kat.position, permission_overwrites,
        }));
        kategoriMap[kat.id] = newKat.id;
        console.log(chalk.green(`[+] ..... ${kat.name} - Kategori olusturuldu`));
        olusturulan++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${kat.name} - Olusturulamadi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${olusturulan} kategori olusturuldu.\n`));
    return kategoriMap;
  }

  static async kanalOlustur(token, guildToId, guildFromId, kategoriMap) {
    const http = api(token);
    const { data: channels } = await req(() => http.get(`/guilds/${guildFromId}/channels`));
    const { data: toRoles } = await req(() => http.get(`/guilds/${guildToId}/roles`));
    const { data: fromRoles } = await req(() => http.get(`/guilds/${guildFromId}/roles`));
    const buildOverwrites = (overwrites) =>
      (overwrites || []).map(ow => {
        const fromRole = fromRoles.find(r => r.id === ow.id);
        if (!fromRole) return null;
        const toRole = toRoles.find(r => r.name === fromRole.name);
        if (!toRole) return null;
        return { id: toRole.id, type: ow.type, allow: ow.allow, deny: ow.deny };
      }).filter(Boolean);

    console.log(chalk.yellow('[~] Metin kanallari olusturuluyor...\n'));
    const metinler = channels.filter(c => c.type === 0).sort((a, b) => a.position - b.position);
    let metin = 0;
    for (const ch of metinler) {
      try {
        await req(() => http.post(`/guilds/${guildToId}/channels`, {
          name: ch.name, type: 0, topic: ch.topic || null,
          nsfw: ch.nsfw || false, rate_limit_per_user: ch.rate_limit_per_user || 0,
          position: ch.position,
          parent_id: ch.parent_id ? kategoriMap[ch.parent_id] || null : null,
          permission_overwrites: buildOverwrites(ch.permission_overwrites),
        }));
        console.log(chalk.green(`[+] ..... ${ch.name} - Metin kanali olusturuldu`));
        metin++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${ch.name} - Olusturulamadi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${metin} metin kanali olusturuldu.\n`));

    console.log(chalk.yellow('[~] Sesli kanallar olusturuluyor...\n'));
    const sesliler = channels.filter(c => c.type === 2).sort((a, b) => a.position - b.position);
    let sesli = 0;
    for (const ch of sesliler) {
      try {
        await req(() => http.post(`/guilds/${guildToId}/channels`, {
          name: ch.name, type: 2, bitrate: ch.bitrate || 64000,
          user_limit: ch.user_limit || 0, position: ch.position,
          parent_id: ch.parent_id ? kategoriMap[ch.parent_id] || null : null,
          permission_overwrites: buildOverwrites(ch.permission_overwrites),
        }));
        console.log(chalk.green(`[+] ..... ${ch.name} - Sesli kanal olusturuldu`));
        sesli++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${ch.name} - Olusturulamadi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${sesli} sesli kanal olusturuldu.\n`));
  }

  static async emojiKopyala(token, guildToId, guildFromId) {
    console.log(chalk.yellow('[~] Emojiler kopyalaniyor...\n'));
    const http = api(token);
    const { data: emojiler } = await req(() => http.get(`/guilds/${guildFromId}/emojis`));
    let olusturulan = 0;
    for (const emoji of emojiler) {
      try {
        const ext = emoji.animated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}`;
        const { data: imgData } = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = `data:image/${ext};base64,${Buffer.from(imgData).toString('base64')}`;
        await req(() => http.post(`/guilds/${guildToId}/emojis`, { name: emoji.name, image: base64 }));
        console.log(chalk.green(`[+] ..... ${emoji.name} - Emoji kopyalandi`));
        olusturulan++;
      } catch (e) {
        console.log(chalk.red(`[x] ..... ${emoji.name} - Kopyalanamadi (${e.response?.data?.message || e.message})`));
      }
    }
    console.log(chalk.green(`\n[+] ${olusturulan} emoji kopyalandi.\n`));
  }

  static async sunucuKopyala(token, guildToId, guildFromId) {
    console.log(chalk.yellow('[~] Sunucu bilgileri kopyalaniyor...\n'));
    const http = api(token);
    const { data: guildFrom } = await req(() => http.get(`/guilds/${guildFromId}`));
    try {
      const body = { name: guildFrom.name };
      if (guildFrom.icon) {
        const ext = guildFrom.icon.startsWith('a_') ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/icons/${guildFromId}/${guildFrom.icon}.${ext}`;
        const { data: imgData } = await axios.get(url, { responseType: 'arraybuffer' });
        body.icon = `data:image/${ext};base64,${Buffer.from(imgData).toString('base64')}`;
      }
      await req(() => http.patch(`/guilds/${guildToId}`, body));
      console.log(chalk.green(`[+] Sunucu adi ve profili kopyalandi.\n`));
    } catch (e) {
      console.log(chalk.red(`[x] Kopyalanamadi (${e.response?.data?.message || e.message})\n`));
    }
  }
}

module.exports = Clone;
