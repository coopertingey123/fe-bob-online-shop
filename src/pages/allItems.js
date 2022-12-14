import { useEffect, useState } from "react";
import SingleItem from "../components/item";

import { toast } from "react-toastify";

export default function AllItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [currentCart, setCurrentCart] = useState();

  const notify = () =>
    toast("Item added to cart!", {
      position: "bottom-left",
      autoClose: 3000,
      hideProgressBar: true,
      closeButton: false,
    });

  const getAllItems = async () => {
    await fetch(`http://127.0.0.1:5000/get/items`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        console.error("Get items error: ", err);
      });
  };

  const handleSearch = async () => {
    await fetch(`http://127.0.0.1:5000/items/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: search,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        console.error("Get items error: ", err);
      });
  };

  useEffect(() => {
    getAllItems();
  }, []);

  const renderItems = () => {
    return items.map((item) => {
      return (
        <SingleItem key={item.item_id} details={item} addToCart={addToCart} />
      );
    });
  };

  const addToCart = (item) => {
    let addedItemsCart = [];

    if (currentCart.length) {
      for (let item of currentCart) {
        addedItemsCart.push(item);
      }
    }

    addedItemsCart.push(item);
    setCurrentCart(addedItemsCart);
    notify();
  };

  const handleFilter = (filter) => {
    let itemsToBeFiltered = [...items];

    switch (filter) {
      case "high-priority":
        const lowToHighPriority = itemsToBeFiltered.sort(
          (a, b) => a.priority - b.priority
        );
        setItems(lowToHighPriority);
        break;
      case "a-to-z":
        const aToZ = itemsToBeFiltered.sort((a, b) =>
          a.name > b.name ? 1 : -1
        );
        setItems(aToZ);
        break;
      case "z-to-a":
        const zToA = itemsToBeFiltered.sort((a, b) =>
          a.name < b.name ? 1 : -1
        );
        setItems(zToA);
        break;
      case "low-to-high":
        const lowToHigh = itemsToBeFiltered.sort((a, b) => a.cost - b.cost);
        setItems(lowToHigh);
        break;
      case "high-to-low":
        const highToLow = itemsToBeFiltered.sort((a, b) => b.cost - a.cost);
        setItems(highToLow);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    let prevLocalCart = localStorage.getItem("shopping-cart");
    let localCart = JSON.parse(prevLocalCart);

    if (typeof localCart === "string") {
      setCurrentCart(JSON.parse(localCart));
    } else if (localCart === null) {
      setCurrentCart([]);
    } else {
      setCurrentCart(localCart);
    }
  }, []);

  useEffect(() => {
    if (currentCart) {
      localStorage.setItem("shopping-cart", JSON.stringify(currentCart));
    }
  }, [currentCart]);

  return (
    <div className="all-items-wrapper">
      <div className="header">
        <h1>All items for sale are listed here</h1>
        <div className="search">
          Search Specific Items:{" "}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />{" "}
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="filter">
          Filter products:
          <select onChange={(e) => handleFilter(e.target.value)}>
            <option value="high-priority">High Priority</option>
            <option value="a-to-z">Name A to Z</option>
            <option value="z-to-a">Name Z to A</option>
            <option value="low-to-high">Price Low to High</option>
            <option value="high-to-low">Price High to Low</option>
          </select>
        </div>
      </div>
      <div className="items-wrapper">{renderItems()}</div>
    </div>
  );
}
