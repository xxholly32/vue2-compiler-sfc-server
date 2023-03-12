import express from 'express'
import { parse, compileTemplate, compileScript, compileStyle } from '@vue/compiler-sfc'
import bodyParser from 'body-parser'
const app = express()

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'x-requested-with,Content-Type');
  next();
}

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(allowCrossDomain);

app.post('/parse', function (req, res) {
  const content = req.body
  try {
    const parsedContent = parse(content)
    const customBlocks = parsedContent.customBlocks

    const template = compileTemplate({
      filename: 'example.vue',
      source: parsedContent.template.content,
      preprocessLang: parsedContent.template.lang
    })

    const script = compileScript(parsedContent)

    const style = parsedContent.styles[0]
    let styleRes = { code: '' }
    if (style) {
      styleRes = compileStyle({
        id: 'v-scope-xxx',
        filename: 'example.vue',
        source: style.content,
        map: style.map,
        scoped: false,
        preprocessLang: style.lang
      })
    }

    res.send({
      // parsedContent,
      template: template.code,
      script,
      style: styleRes.code,
      customBlocks
    })
  } catch (error) {
    res.send({
      error
    })
  }

})

app.get('/', function(req, res) {
  res.send('hello world');
});

app.listen(process.env.PORT ||4000)
console.log('listening on port 4000')
