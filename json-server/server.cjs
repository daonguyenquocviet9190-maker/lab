const fs = require("fs");
const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const dataDir = path.join(process.cwd(), "src", "data");

const resourceFiles = {
  products: "products.json",
  lipsticks: "lipsticks.json",
  perfumes: "perfumes.json",
  blogPosts: "blogPosts.json",
  users: "users.json",
  orders: "orders.json",
  reviews: "reviews.json",
};

function getFilePath(resource) {
  const fileName = resourceFiles[resource];

  if (!fileName) {
    return null;
  }

  return path.join(dataDir, fileName);
}

function readResource(resource) {
  const filePath = getFilePath(resource);

  if (!filePath || !fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResource(resource, value) {
  const filePath = getFilePath(resource);

  if (!filePath) {
    return;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function applySearch(items, query) {
  const keyword = normalizeValue(query?.q);

  if (!keyword) {
    return items;
  }

  return items.filter((item) => {
    const haystacks = [
      item.name,
      item.title,
      item.brand,
      item.origin,
      item.sectionLabel,
      Array.isArray(item.categories) ? item.categories.join(" ") : "",
      item.email,
      item.username,
      item.fullName,
      item.productKey,
      item.productName,
      item.authorName,
      item.authorEmail,
    ];

    return haystacks.some((value) => normalizeValue(value).includes(keyword));
  });
}

function applyEqualityFilters(items, query) {
  const reservedKeys = new Set(["q", "_sort", "_order", "_page", "_limit"]);

  return items.filter((item) =>
    Object.entries(query).every(([key, value]) => {
      if (reservedKeys.has(key) || value == null || value === "") {
        return true;
      }

      const sourceValue = item[key];

      if (Array.isArray(sourceValue)) {
        return sourceValue.map((entry) => String(entry)).includes(String(value));
      }

      return String(sourceValue ?? "") === String(value);
    }),
  );
}

function applySort(items, query) {
  const sortKey = query._sort;

  if (!sortKey) {
    return items;
  }

  const order = String(query._order ?? "asc").toLowerCase() === "desc" ? -1 : 1;

  return [...items].sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];

    if (leftValue == null && rightValue == null) {
      return 0;
    }

    if (leftValue == null) {
      return 1;
    }

    if (rightValue == null) {
      return -1;
    }

    if (leftValue > rightValue) {
      return order;
    }

    if (leftValue < rightValue) {
      return -order;
    }

    return 0;
  });
}

function applyPagination(items, query, response) {
  const page = Number(query._page ?? 0);
  const limit = Number(query._limit ?? 0);

  if (!page || !limit) {
    return items;
  }

  const startIndex = (page - 1) * limit;
  const paginated = items.slice(startIndex, startIndex + limit);
  response.setHeader("X-Total-Count", String(items.length));

  return paginated;
}

function buildCollectionHandler(resource) {
  return (request, response) => {
    let items = readResource(resource);
    items = applySearch(items, request.query);
    items = applyEqualityFilters(items, request.query);
    items = applySort(items, request.query);
    items = applyPagination(items, request.query, response);
    response.jsonp(items);
  };
}

function buildItemHandler(resource) {
  return (request, response) => {
    const items = readResource(resource);
    const item = items.find((entry) => String(entry.id) === String(request.params.id));

    if (!item) {
      response.status(404).jsonp({ message: "Not found" });
      return;
    }

    response.jsonp(item);
  };
}

function buildCreateHandler(resource) {
  return (request, response) => {
    const items = readResource(resource);
    const nextItem = {
      id: request.body?.id ?? Date.now(),
      ...request.body,
    };

    items.push(nextItem);
    writeResource(resource, items);
    response.status(201).jsonp(nextItem);
  };
}

function buildPatchHandler(resource) {
  return (request, response) => {
    const items = readResource(resource);
    const index = items.findIndex((entry) => String(entry.id) === String(request.params.id));

    if (index === -1) {
      response.status(404).jsonp({ message: "Not found" });
      return;
    }

    const nextItem = {
      ...items[index],
      ...request.body,
    };

    items[index] = nextItem;
    writeResource(resource, items);
    response.jsonp(nextItem);
  };
}

function buildDeleteHandler(resource) {
  return (request, response) => {
    const items = readResource(resource);
    const nextItems = items.filter((entry) => String(entry.id) !== String(request.params.id));

    if (nextItems.length === items.length) {
      response.status(404).jsonp({ message: "Not found" });
      return;
    }

    writeResource(resource, nextItems);
    response.status(200).jsonp({});
  };
}

server.use(middlewares);
server.use(jsonServer.bodyParser);

Object.keys(resourceFiles).forEach((resource) => {
  server.get(`/${resource}`, buildCollectionHandler(resource));
  server.get(`/${resource}/:id`, buildItemHandler(resource));
  server.post(`/${resource}`, buildCreateHandler(resource));
  server.patch(`/${resource}/:id`, buildPatchHandler(resource));
  server.delete(`/${resource}/:id`, buildDeleteHandler(resource));
});

server.get("/", (_request, response) => {
  response.jsonp({
    message: "json-server fake REST API is running",
    resources: Object.keys(resourceFiles),
  });
});

const port = Number(process.env.JSON_SERVER_PORT || 3001);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`JSON Server is running at http://localhost:${port}`);
});
