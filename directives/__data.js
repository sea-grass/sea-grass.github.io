window.__sveltekit_data = (function(a,b,c){return {type:b,nodes:[null,{type:b,data:{href:c,html:"\u003Cdiv class=\"partial\"\u003E\u003Cp\u003E\u003Ca href=\"\u002F\"\u003Ehome\u003C\u002Fa\u003E\u003C\u002Fp\u003E\n\u003Cp\u003E\u003Cimg src=\"\u002Fbanner.webp\" alt=\"banner\" height=\"100\"\u003E\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\n\u003Ch1\u003EDirectives\u003C\u002Fh1\u003E\n\u003Cp\u003EMarkdown \u003Ca href=\"https:\u002F\u002Ftalk.commonmark.org\u002Ft\u002Fgeneric-directives-plugins-syntax\u002F444\"\u003Egeneric directives\u003C\u002Fa\u003E are a proposed syntax to extend markdown with custom features\u002Fplugins while still remaining fairly human readable.\u003C\u002Fp\u003E\n\u003Cp\u003EThis page demos the directives I've added to this site's markdown processor (based on \u003Ca href=\"https:\u002F\u002Fgithub.com\u002Fremarkjs\u002Fremark\"\u003Eremark\u003C\u002Fa\u003E).\u003C\u002Fp\u003E\n\u003Cp\u003EThere are three kinds of directives: text, leaf, and container.\u003C\u002Fp\u003E\n\u003Ch2\u003EText Directives\u003C\u002Fh2\u003E\n\u003Cp\u003EText directives start with a single colon (\u003Ccode\u003E:\u003C\u002Fcode\u003E).\u003C\u002Fp\u003E\n\u003Ch3\u003EBold\u003C\u002Fh3\u003E\n\u003Cdetails\u003E\u003Csummary\u003E\u003Ccode\u003E:bold[bolded]\u003C\u002Fcode\u003E\u003C\u002Fsummary\u003E\u003Cp\u003E\u003Cb\u003Ebolded\u003C\u002Fb\u003E\u003C\u002Fp\u003E\u003C\u002Fdetails\u003E\n\u003Cp\u003EIn markdown, you can wrap content with two asterisks to \u003Cstrong\u003Ebold\u003C\u002Fstrong\u003E it. This directive reproduces this behaviour. This text will be \u003Cb\u003Ebolded\u003C\u002Fb\u003E! This directive is an example of how directives can be created and shouldn't be used in actual markdown documents.\u003C\u002Fp\u003E\n\u003Ch3\u003ECrossed out\u003C\u002Fh3\u003E\n\u003Cdetails\u003E\u003Csummary\u003E\u003Ccode\u003E:crossedout[This is cool!]\u003C\u002Fcode\u003E\u003C\u002Fsummary\u003E\u003Cp\u003E\u003Cdel\u003EThis is cool!\u003C\u002Fdel\u003E\u003C\u002Fp\u003E\u003C\u002Fdetails\u003E\n\u003Cp\u003EThe \u003Ccode\u003E:crossedout[content]\u003C\u002Fcode\u003E directive will cross out the content \u003Cdel\u003Elike this\u003C\u002Fdel\u003E. It's another example directive that mirrors the functionality of markdown's own syntax.\u003C\u002Fp\u003E\n\u003Ch2\u003ELeaf Directives\u003C\u002Fh2\u003E\n\u003Ch3\u003ELatest Page\u003C\u002Fh3\u003E\n\u003Cp\u003EThe \u003Ccode\u003E::pagelatest[collection]\u003C\u002Fcode\u003E directive looks for all pages, sorts them by date, and injects\nthe content of the most recent page in the collection.\u003C\u002Fp\u003E\n\u003Ch2\u003EContainer Directives\u003C\u002Fh2\u003E\n\u003Ch3\u003EInline List\u003C\u002Fh3\u003E\n\u003Cp\u003EThe \u003Ccode\u003E:::inlineList\u003C\u002Fcode\u003E directive renders a markdown list inline by wrapping it in a container div.\u003C\u002Fp\u003E\n\u003Cul\u003E\n\u003Cli\u003ERegular markdown lists\u003C\u002Fli\u003E\n\u003Cli\u003EAppear in list form\u003C\u002Fli\u003E\n\u003Cli\u003ELike this\u003C\u002Fli\u003E\n\u003C\u002Ful\u003E\n\u003Cdiv class=\"inline-list\"\u003E\u003Cul\u003E\n\u003Cli\u003EInline lists\u003C\u002Fli\u003E\n\u003Cli\u003EAre still semantically lists\u003C\u002Fli\u003E\n\u003Cli\u003Ebut appear inline\u003C\u002Fli\u003E\n\u003C\u002Ful\u003E\u003C\u002Fdiv\u003E",frontmatter:{slug:c},title:"Directives",description:"",css:".hiding{opacity:0}.hiding:hover{opacity:unset}.inline-list,.inline-list p:first-of-type{display:inline-block}.inline-list p:first-of-type:after{content:\"\";display:inline-block;width:1ch}.inline-list :is(ul,ol){display:inline-flex;flex-wrap:wrap;list-style:none;padding:0}.inline-list :is(ul,ol)\u003Eli:not(:last-of-type){margin-right:1ch}.inline-list :is(ul,ol)\u003Eli:not(:last-of-type):after{content:\", \"}*{box-sizing:border-box}:root{font-size:16px}:is(h1,h2,h3,h4,h5,h6,p){margin:0;padding:0}:is(ul,ol){margin:0}p{margin:.5em 0}html{display:flex}body{border:1px solid #000;max-width:clamp(320px,80vw,120ch);padding:0 1rem}:is(h1,h2,h3,h4,h5,h6,p,li){line-height:1.5}img{max-width:100%}"},uses:{dependencies:a,params:["slug"],parent:a,url:a}}]}}(void 0,"data","\u002Fdirectives"))