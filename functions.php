<?php

add_theme_support('post-thumbnails');
register_nav_menu('main', 'Main Menu');

add_filter('timber_context', 'timber_context');
function timber_context($data) {
  $data['menu'] = new TimberMenu('main');
  return $data;
}

add_action('wp_enqueue_scripts', 'scripts');
function scripts() {
  wp_enqueue_script('frontend', get_template_directory_uri() .'/lib/js/dummy.js');
  wp_localize_script('frontend', 'wordpress', [
    'home_url' => home_url()
  ]);
}

add_filter('nav_menu_css_class', 'menu_class', 10, 2);
function menu_class($classes, $item) {
  // Highlight menu item in post type archive, taxonomy, and singular
  $post_types = get_post_types(['_builtin' => false]);
  foreach ($post_types as $pt) {
    $post_type = get_post_type_object($pt);
    $title = $post_type->labels->name;
    $menu_title = $post_type->labels->menu_name;
    if ($item->title === $title || $item->title === $menu_title) {
      foreach (get_object_taxonomies($pt) as $tax) {
        if (is_tax($tax)) {
          $classes []= 'current-menu-item';
          break;
        }
      }
      if (is_post_type_archive($pt) || is_singular($pt)) {
        $classes []= 'current-menu-item';
      }
    }
  }
  // if (is_search() && $item->title == 'Title') {
  //   $classes []= 'current-menu-item';
  // }
  return $classes;
}

add_action('query_vars', 'query_vars', 10, 1);
function query_vars($vars) {
  // $vars []= 'myvar'
  return $vars;
}

add_action('pre_get_posts', 'pre_get_posts');
function pre_get_posts($query) {
  if (is_admin() || !$query->is_main_query())
    return;
}

add_filter('the_excerpt', 'highlight_search_term');
add_filter('the_title', 'highlight_search_term');
function highlight_search_term($text) {
  if (is_search() && get_search_query()) {
    $terms = implode('|', explode(' ', get_search_query()));
    $text = preg_replace('/('. $terms .')/i', '<span class="search-term--highlight">\0</span>', $text);
  }
  return $text;
}
