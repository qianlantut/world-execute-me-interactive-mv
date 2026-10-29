# 本地音乐

源码仓库不单独分发原曲录音。构建时请提供你自己的 Mili《world.execute(me);》音频文件，约 3 分 32 秒的专辑版本。

可以把文件放在这里并命名为 `world.execute(me).m4a`，然后运行 `python build.py`；也可以直接指定本地路径：

```sh
python build.py --audio "path/to/world.execute(me).m4a"
```

音乐会被内嵌到生成的 HTML。不同版本的前奏、留白或时长可能影响同步。这里的音频文件被 `.gitignore` 排除。

只想游玩，请下载仓库 Releases 中的交互版压缩包，无须自己构建。

原曲：[Mili 官方投稿](https://www.bilibili.com/video/BV1ds411e7df/) · [Mili 使用指南](https://project-mili.squarespace.com/copyright-guidelines)
