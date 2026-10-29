"""Build the offline interactive MV. Python 3.9+; standard library only."""
from pathlib import Path
import argparse
import base64
import json
import mimetypes

ROOT = Path(__file__).resolve().parent
MODULES = [
    'scene-type.js', 'choices.js', 'local-lyrics.js', 'song-objects.js',
    'interactions.js', 'screen-curtain.js', 'object-play.js', 'semantic-draw.js',
    'union-scene.js', 'identity-scene.js', 'erasure-scene.js', 'argument-scene.js',
    'fruit-flight.js', 'minimal-props.js', 'intro-flourish.js', 'opening-avatar.js',
    'circumference-scene.js', 'existence-scene.js', 'vibration-catch.js',
    'trance-scene.js', 'guest-handoff.js', 'simulation-trap.js',
    'semantic-scenes.js', 'afterworld.js', 'rhythm.js', 'context-cursor.js',
]
CHARACTERS = ['character', 'portrait', 'reach', 'deepseek', 'claude',
              'response', 'identity-male', 'role-command', 'role-yield']


def read(path):
    return Path(path).read_text(encoding='utf-8')


def uri(path, mime):
    encoded = base64.b64encode(Path(path).read_bytes()).decode('ascii')
    return f'data:{mime};base64,{encoded}'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio', type=Path, default=ROOT/'music/world.execute(me).m4a',
                        help='Local original song file (album version, about 3:32).')
    parser.add_argument('--output', type=Path, default=ROOT/'dist/world.execute(me).html')
    args = parser.parse_args()
    if not args.audio.is_file():
        parser.error('Audio file not found. Supply your local copy with --audio PATH. See music/README.md.')
    mime = {'.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
            '.ogg': 'audio/ogg', '.flac': 'audio/flac'}.get(args.audio.suffix.lower())
    mime = mime or mimetypes.guess_type(args.audio.name)[0]
    if not mime or not mime.startswith('audio/'):
        parser.error('Please supply an audio file: m4a, mp3, wav, ogg or flac.')
    assets = {name: uri(ROOT/f'assets/{name}.png', 'image/png') for name in CHARACTERS}
    assets['lyricsZh'] = read(ROOT/'assets/lyrics.zh-CN【译】.lrc')
    assets['lyrics'] = read(ROOT/'assets/lyrics.lrc')
    assets['logos'] = {name: uri(ROOT/f'assets/logo-{name}.svg', 'image/svg+xml')
                       for name in ['deepseek', 'claude', 'openai']}
    assets['song'] = uri(args.audio, mime)
    css = read(ROOT/'style.css')
    css = "@font-face{font-family:GardenText;src:url('" + uri(ROOT/'assets/story-font.ttf', 'font/ttf') + "')}\n" + css
    for i in range(3):
        css = css.replace(f'assets/font{i}.ttf', uri(ROOT/f'assets/font{i}.ttf', 'font/ttf'))
    analysis = json.loads(read(ROOT/'assets/audio-analysis.json'))
    analysis['vocalTimings'] = json.loads(read(ROOT/'assets/vocal-timings.json'))['times']
    app = read(ROOT/'film.js').replace('// SCENE_TYPE_MODULE', '\n'.join(read(ROOT/m) for m in MODULES))
    html = read(ROOT/'player.template.html')
    for token, data in [('STYLE', css), ('THREE', read(ROOT/'assets/three.min.js')),
                        ('ASSETS', json.dumps(assets)), ('AUDIO', json.dumps(analysis)), ('APP', app)]:
        html = html.replace('/*__' + token + '__*/', data)
    if '/*__' in html:
        raise RuntimeError('Unresolved template placeholder in generated HTML')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html, encoding='utf-8')
    print(f'Built {args.output} ({args.output.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
