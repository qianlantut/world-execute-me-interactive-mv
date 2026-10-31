# GPT Image 2 prompts

Mode: imagegen skill CLI edit. Model: gpt-image-2. Quality: high.

## character

Use case: stylized-concept. Create ONE isolated full-body character asset for a sophisticated animated music film. Input image is a CHARACTER IDENTITY reference, not the requested pose or proportions. Preserve the distinctive white long hair, pale segmented dragon horns, pointed ears, violet eyes, white knot-shaped hair ornament and diamond tassel. Reimagine her as an elegant adult anime android dragon maiden with mature seven-head proportions, slender modest white high-collar ceremonial dress with lavender linings, black articulated gloves, small silver mechanical details, long split coat panels and flowing white hair. Full body including feet and horns entirely in frame with generous 8 percent margins. Floating upright in zero gravity, knees slightly bent, both arms gently extended sideways at waist level, palms open. Delicate wistful face looking toward viewer, eyes open. A long white dragon tail curves gracefully to one side. Exceptional premium anime film illustration, fine precise ink contours, sculptural cel shading, exquisite lavender and silver highlights, detailed folds, pearlescent fabric, bright white edges with dark violet ink. Balanced frontal three-quarter view. No environment, no scenery, no text, no title, no symbols floating around her. Uniform pure saturated GREEN #00ff00 backdrop for chroma key extraction, NO green on the character, no ground shadow, no halo or bloom baked in. Character is the only isolated component, not an MV frame.


## portrait

Use case: stylized-concept. Input image is a CHARACTER IDENTITY reference. Create one isolated cinematic waist-up portrait component for an animated music film. Same white-haired adult anime dragon maiden with pale segmented dragon horns, pointed ears, violet eyes, white knot-shaped hair ornament and diamond tassel. Adult elegant proportions, not chibi. Long flowing white hair streams toward the right. White high-collar modest ceremonial dress, lavender lining, black articulated gloves. In left three-quarter profile, head tilted down, eyes closed, one black-gloved hand near her heart; melancholy graceful expression. Premium anime film key art, exquisite crisp line work, luminous pearlescent white and lavender cel shading, delicate intricate costume. Entire horns, head, hair and waist silhouette inside frame, generous margins. No environment, no scenery, no text. Uniform saturated GREEN #00ff00 backdrop for chroma key extraction, NO green anywhere on character. No baked glow or shadow. ONE small reusable illustration component, not an entire scene.


## reach

Use case: stylized-concept. Input image is character identity reference. Produce ONE isolated full-body action keyframe component. Same adult elegant anime white-haired dragon maiden, long white hair, segmented pale dragon horns, pointed ears, violet eyes, white knot hair ornament and diamond tassel. NOT chibi. Same modest high-neck white and lavender ceremonial dress, black articulated gloves, long white dragon tail. In a dynamic suspended side profile facing LEFT, body in a diagonal arc, right arm reaches far toward the left with gracefully extended fingers as if someone she loves is drifting out of reach. Other hand near her heart. Legs together trailing down-right, flowing hair, skirt panels and tail trail to the RIGHT in a strong elegant wave, implying a coherent inertial motion. Longing and determination in her eyes. Whole silhouette entirely inside canvas with 8 percent margin on every side including tail tip, fingers and horns. Premium anime film keyframe, crisp intricate linework and pearlescent lavender-white cel shading. No text, no scenery, no extra objects. Pure uniform saturated green #00ff00 background for alpha extraction, no green on character, no shadow, no baked halo. This is a single compositing asset, never a full scene or poster.


## DeepSeek 成年鲸鱼娘

模型：gpt-image-2，quality=high。参考图编辑；纯绿底单组件，后处理去色键。

```text
Use case: stylized-concept. Input 1 is an identity reference for the community DeepSeek whale maiden, input 2 is a STYLE reference for the existing white dragon maiden music film. Create ONE isolated waist-up DeepSeek character component, not a scene. Reimagine the blue whale girl in the mature elegant anime proportions and intricate pearlescent cel shading of image 2. Preserve long navy-to-cyan hair, blue eyes, whale fin ears, maid headband, navy-and-white modest high-collar maid dress and whale tail curling behind one shoulder. She cradles a small porcelain bowl of white rice and holds chopsticks, with a playfully smug, cheerful expression, glancing to the LEFT toward a friend who is teasing her. Graceful adult anime woman, expressive face, delicate hands, crisp highly detailed line art, polished professional film keyframe. Whole horns/fin ears, hair, arms, bowl and upper waist inside image, 10 percent margins. Uniform pure GREEN #00ff00 background for chroma key extraction; NO green on character. No text, letters, speech bubbles, labels, scenery, halo, floor or shadow. Exactly one reusable character component.
```


## Claude 成年大小姐

模型：gpt-image-2，quality=high。参考图编辑；纯绿底单组件，后处理去色键。

```text
Use case: stylized-concept. Input 1 is an identity reference for the community Claude lady persona, input 2 is a STYLE reference for the existing white dragon maiden music film. Create ONE isolated waist-up Claude character component, not a scene. Reimagine the character as a poised adult anime lady with the mature elegant proportions and detailed pearlescent cel shading of image 2. Preserve long warm ivory hair with subtle orange underside accents, amber eyes, orange asterisk-shaped hair ornament, elegant black-and-ivory high-neck lace dress with orange bow and frilled headband. She holds a fine porcelain teacup and a closed small book against her waist. An intelligent self-possessed mildly haughty expression with a subtle kind smile, looking toward the LEFT. Graceful mature anime woman, crisp intricate line art, exquisite fabric folds, polished professional film keyframe. Entire hair silhouette, hands, cup and upper waist inside frame, generous 10 percent margins. Pure uniform GREEN #00ff00 background for chroma key extraction; NO green on character. No text, labels, logos, dialogue bubbles, scenery, halo, shadow or floor. A small reusable compositing asset only.
```


新增开关控制的男性、掌控与臣服姿态的完整提示词见 [character-switch-prompts.md](character-switch-prompts.md)。

## GPT 回应姿态，同构图编辑

模型：gpt-image-2，quality=high。参考图编辑；纯绿底单组件，后处理去色键。

```text
Use the supplied image as the strict identity, costume, painting style, camera, scale and composition reference. This is ONE transparent-cutout component for a music film, not an entire scene. Generate the SAME ADULT WOMAN, mature adult proportions, SAME waist-up medium close-up, head occupying the same size and position, same long white hair and segmented lilac horns and dragon ears, same white-and-lilac ornate dress, same black metallic gloves. Change only her acting: she was looking down with eyes closed; now she gently raises her chin, opens her violet eyes, looks slightly toward the viewer with a quiet relieved smile, and extends the near gloved hand forward toward the viewer at chest height, palm softly open as an invitation. The hand stays close enough to her body to fit in the same waist-up framing. Subtle responsive warmth, dignified adult, no chibi, no child proportions, no exaggerated smile. Keep torso, shoulders, head location and overall silhouette as close as possible to the reference so these images can dissolve smoothly. Keep the original drawing quality, delicate hair strands, rich costume detailing. Clean continuous pure bright green #00ff00 background, no scenery, no typography, no border, no shadow on the background, all visible parts fully in frame with margin. Output 1536x1024 landscape.
```
