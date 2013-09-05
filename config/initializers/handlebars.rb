#Gem uses outdated version of handlebars with bugs in safari
HandlebarsAssets::Config.compiler = 'handlebars-latest.js' # Change the name of the compiler file
HandlebarsAssets::Config.compiler_path = Rails.root.join('vendor/assets/javascripts') # Change the location of the compiler file