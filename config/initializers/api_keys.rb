API_KEYS = YAML.load_file(Rails.root.join('config','keys.yml')).with_indifferent_access[Rails.env]