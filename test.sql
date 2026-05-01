SELECT p.id, p.name, p."categoryId", p."subCategoryId", sc.name as subname
FROM products p
LEFT JOIN sub_categories sc ON p."subCategoryId" = sc.id
WHERE p.name = 'Kola';
