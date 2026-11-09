"""
Utilitário para a TV LG (webOS) pela rede local, sem root.

    python lg_tv.py IP_DA_TV apps          lista apps e entradas com seus IDs
    python lg_tv.py IP_DA_TV som           mostra a saída de som atual
    python lg_tv.py IP_DA_TV som VALOR     troca a saída de som (use o valor que o comando "som" mostrar)

Requer Python 3.12+ e: pip install aiowebostv
Na primeira vez a TV pergunta se aceita a conexão: confirme no controle.
"""
import asyncio
import pathlib
import sys

from aiowebostv import WebOsClient

KEY_FILE = pathlib.Path(__file__).with_name(".lg_client_key")


async def main(host: str, cmd: str, extra: list[str]) -> None:
    key = KEY_FILE.read_text().strip() if KEY_FILE.exists() else None
    client = WebOsClient(host, key)
    if key is None:
        print("Aceite a conexão que vai aparecer na TV...")
    await client.connect()
    if client.client_key and client.client_key != key:
        KEY_FILE.write_text(client.client_key)

    try:
        if cmd == "apps":
            apps = await client.get_apps() or []
            print(f"{'APP':<32} ID")
            for app in sorted(apps, key=lambda a: a.get("title", "").lower()):
                print(f"{app.get('title', ''):<32} {app['id']}")
            inputs = await client.get_inputs() or []
            print(f"\n{'ENTRADA':<32} ID")
            for dev in inputs:
                print(f"{dev.get('label', ''):<32} {dev.get('appId', dev.get('id', ''))}")
        elif cmd == "som":
            if extra:
                await client.change_sound_output(extra[0])
            print("Saída de som atual:", await client.get_sound_output())
        else:
            print(__doc__)
    finally:
        await client.disconnect()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3:]))
