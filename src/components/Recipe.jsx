import React, { useState, useEffect } from "react";
import { IconName } from "react-icons/ai";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Recipe.css";

const Recipe = () => {

  const [recipes, setRecipes] = useState([]);

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const [filterTags, setFilterTags] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [sortOption, setSortOption] = useState(""); 
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  
    const fetchRecipes = async () => {
      try {
        const res = await fetch("https://project2-data.onrender.com/recipes");
        const data = await res.json();
        setRecipes(data);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    };

  
  const handleCheckboxChange = (id) => {
    setSelectedRecipes((prev) =>
      prev.includes(id) ? prev.filter((recipeId) => recipeId !== id) : [...prev, id]
    );
  };

  
  const handleGenerateJSONAndEmail = () => {
    const filteredRecipes = recipes.filter((recipe) =>
      selectedRecipes.includes(recipe.id)
    );
    const json = JSON.stringify(filteredRecipes, null, 2);

    const subject = encodeURIComponent("Selected Recipes JSON");
    const body = encodeURIComponent(json);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const res = await toast.promise(fetch(`https://project2-data.onrender.com/recipes?page=${page}&limit=6`),
        {
          pending: 'Loading',
          success: 'Loaded 👌',
          error: 'Rejected 🤯'
        }, {
          autoClose: 1000
      
        });
        const data = await res.json();
  
        setRecipes((prev) => {
          const newRecipes = data.filter(
            (newRecipe) => !prev.some((recipe) => recipe.id === newRecipe.id)
          );
          return [...prev, ...newRecipes];
        });
  
        if (data.length === 0) setHasMore(false);
      } catch (error) {
        console.error("Failed to load recipes:", error);
      }
      setLoading(false);
    };
  
    loadRecipes();
  }, [page]);
  
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    if (hasMore) setPage((prev) => prev + 1);
  };
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);
  
  const handleSearch = async () => {
    // if (!searchQuery.trim()) return; 

    try {
      const response = await fetch(
        `https://project2-data.onrender.com/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const searchResults = await response.json();

      if (response.ok) {
        setRecipes(searchResults);
      } else {
        console.error("Error searching recipes:", searchResults.error);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
    }
  };

  const handleApplyFilter = async () => {
    
    // if (!filterTags && !filterDifficulty) {
    //   alert("Please provide at least one filter criteria.");
    //   return;
    // }

    try {
      
      const params = new URLSearchParams();
      if (filterTags) params.append("tags", filterTags);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);

      const response = await fetch(
        `https://project2-data.onrender.com/api/filter?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered recipes");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching filtered recipes:", error.message);
      alert("An error occurred while applying filters.");
    }
  };

  const handleSort = async () => {
    if (!sortOption) {
      return;
    }

    try {
      const response = await fetch(
        `https://project2-data.onrender.com/api/sort?sortBy=${sortOption}&order=${sortOrder}`
      );
      const sortedRecipes = await response.json();

      if (response.ok) {
        setRecipes(sortedRecipes);
      } else {
        console.error("Error sorting recipes:", sortedRecipes.error);
      }
    } catch (error) {
      console.error("Error in handleSort:", error);
    }
  };

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (index) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const reorderedItems = Array.from(recipes);
    const [movedItem] = reorderedItems.splice(draggedItemIndex, 1);
    reorderedItems.splice(index, 0, movedItem);

    setRecipes(reorderedItems);
    setDraggedItemIndex(null);

    const updatedOrder = {
      id: movedItem.id,
      newIndex: index,
    };

    console.log(Array.from(updatedOrder))
    
    try {
      await updateOrderInBackend(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
    }
    
  };

  const updateOrderInBackend = async (updatedOrder) => {
    try {
      console.log(updatedOrder)
      await fetch("https://project2-data.onrender.com/api/update-order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });
    } catch (error) {
      console.error("Failed to update order in backend:", error);
    }
  };


  
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    tags: "",
    difficulty: "Easy",
  });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (sortOption) {
      handleSort();
    }
  }, [sortOption, sortOrder]);

  const API_URL = "https://project2-data.onrender.com/recipes";

  // useEffect(() => {
  //   fetch(API_URL)
  //     .then((res) => res.json())
  //     .then((data) => setRecipes(data))
  //     .catch((err) => console.error("Error fetching recipes:", err));
  // }, []);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (editIndex !== null) {
      const updatedRecipes = [...recipes];
      updatedRecipes[index][name] = value;
      updatedRecipes[index].date = new Date().toLocaleString();
      setRecipes(updatedRecipes);
    } else {
      setNewRecipe({ ...newRecipe, [name]: value });
    }
  };

  const handleAddRecipe = () => {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newRecipe,
        id: Date.now().toString(),
        date: new Date().toLocaleString()
      }),
    })
      .then((res) => res.json())
      .then((newRecipe) => {
        setRecipes([...recipes, newRecipe]);
        setNewRecipe({
          title: "",
          description: "",
          ingredients: "",
          steps: "",
          tags: "",
          difficulty: "Easy",
        });
        setShowForm(false);

        toast.success('Created Successfuly!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
      });
      })
      .catch((err) => console.error("Error adding recipe:", err));
  };

  const handleEditRecipe = (index) => {
    setEditIndex(index);
  };

  const handleSaveEdit = async (index) => {
    const updatedRecipe = recipes[index];
    await fetch(`${API_URL}/${updatedRecipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRecipe),
    })
      .then((res) => res.json())
      .then(() => {
        setEditIndex(null);
        toast.success('Updated Successfuly!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
      })
      .catch((err) => console.error("Error updating recipe:", err));
      
  };

  const handleDeleteRecipe = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setRecipes(recipes.filter((recipe) => recipe.id !== id));
        toast.success('Deleted Successfuly!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
      });
      })
      .catch((err) => console.error("Error deleting recipe:", err));
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="main-container">
        <div className="control-panel">

        <div style={{display: "flex", justifyContent: "flex-end"}}>
              <div className="control-section">
                <button
                  className="create-recipe-button"
                  onClick={() => setShowForm(!showForm)}
                >
                {showForm ? "Cancel" : "New Recipe"}
              </button>
            </div>

            <div className="control-section">
              <button onClick={() => setIsPopupOpen(true)}>Export Recipes</button>
            </div>
            </div>

            {showForm && (
          <div className="recipe-form">
            <h3>Create Recipe</h3>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newRecipe.title}
              onChange={(e) => handleInputChange(e)}
            />
            <textarea
              name="description"
              placeholder="Description"
              rows="2"
              value={newRecipe.description}
              onChange={(e) => handleInputChange(e)}
            ></textarea>
            <textarea
              name="ingredients"
              placeholder="Ingredients"
              rows="2"
              value={newRecipe.ingredients}
              onChange={(e) => handleInputChange(e)}
            ></textarea>
            <textarea
              name="steps"
              placeholder="Steps"
              rows="2"
              value={newRecipe.steps}
              onChange={(e) => handleInputChange(e)}
            ></textarea>
            <input
              type="text"
              name="tags"
              placeholder="Tags"
              value={newRecipe.tags}
              onChange={(e) => handleInputChange(e)}
            />
            <select
              name="difficulty"
              value={newRecipe.difficulty}
              onChange={(e) => handleInputChange(e)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <button className="save-button" onClick={handleAddRecipe}>
              Save
            </button>
          </div>
        )}
          <div className="searchdiv">
          <div className="control-search">
            <h3>Search</h3>
            <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
              <input
              style={{height: "100%"}}
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>

            
          </div>

          <div className="filterandsort">
            <div className="control-filter">
              <h3>Filter</h3>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <input
                style={{width: "65%"}}
                  type="text"
                  placeholder="Tags"
                  value={filterTags}
                  onChange={(e) => setFilterTags(e.target.value)}
                />
                <select
                style={{width: "35%"}}
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <button onClick={handleApplyFilter}>Apply</button>
            </div>
            <div className="control-sort">
              <h3>Sort</h3>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <select
                style={{width: "70%"}}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="">No Sorting</option>
                  <option value="title">Title</option>
                  <option value="date">Last Updated</option>
                  <option value="tags">Tags</option>
                  <option value="difficulty">Difficulty</option>
                </select>
                <select
                style={{width: "30%"}}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>
            </div>
          </div>
        </div>

       
        {isPopupOpen && (
          <div className="overlay">
            <div className="popup">
              <h3 className="popup-header">Select Recipes to Export</h3>
              <ul className="popup-list">
                {recipes.map((recipe) => (
                  <li key={recipe.id} className="popup-list-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRecipes.includes(recipe.id)}
                        onChange={() => handleCheckboxChange(recipe.id)}
                      />
                      {recipe.title}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="popup-footer">
                <button
                  onClick={handleGenerateJSONAndEmail}
                  className="action-button"
                >
                  Generate JSON and Email
                </button>
                <button onClick={() => setIsPopupOpen(false)} className="close-button">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>


      <div className="recipe-cards-container">
  {recipes.map((recipe, index) => (
    <div
      className="recipe-card"
      key={recipe.id}
      draggable
      onDragStart={() => handleDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(index)}
    >
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        <p>
          <strong>Description:</strong> {recipe.description}
        </p>
        <p>
          <strong>Ingredients:</strong> {recipe.ingredients}
        </p>
        <p>
          <strong>Steps:</strong> {recipe.steps}
        </p>
        <p>
          <strong>Tags:</strong> {recipe.tags}
        </p>
        <p>
          <strong>Difficulty:</strong> {recipe.difficulty}
        </p>
        <div className="actions">
          <button onClick={() => handleEditRecipe(index)}>Edit</button>
          <button onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
        </div>
      </div>
    </div>
  ))}

{/* {loading && <div className="loading">Loading...</div>}  */}

  {editIndex !== null && (
    <div className="popup-overlay">
      <div className="popup-content">
        <label htmlFor={`title-${editIndex}`}>Title</label>
        <input
          id={`title-${editIndex}`}
          type="text"
          name="title"
          value={recipes[editIndex].title}
          onChange={(e) => handleInputChange(e, editIndex)}
        />

        <label htmlFor={`description-${editIndex}`}>Description</label>
        <textarea
          id={`description-${editIndex}`}
          name="description"
          rows="3"
          value={recipes[editIndex].description}
          onChange={(e) => handleInputChange(e, editIndex)}
        ></textarea>

        <label htmlFor={`ingredients-${editIndex}`}>Ingredients</label>
        <textarea
          id={`ingredients-${editIndex}`}
          name="ingredients"
          rows="3"
          value={recipes[editIndex].ingredients}
          onChange={(e) => handleInputChange(e, editIndex)}
        ></textarea>

        <label htmlFor={`steps-${editIndex}`}>Steps</label>
        <textarea
          id={`steps-${editIndex}`}
          name="steps"
          rows="3"
          value={recipes[editIndex].steps}
          onChange={(e) => handleInputChange(e, editIndex)}
        ></textarea>

        <label htmlFor={`tags-${editIndex}`}>Tags</label>
        <input
          id={`tags-${editIndex}`}
          type="text"
          name="tags"
          value={recipes[editIndex].tags}
          onChange={(e) => handleInputChange(e, editIndex)}
        />

        <label htmlFor={`difficulty-${editIndex}`}>Difficulty</label>
        <select
          id={`difficulty-${editIndex}`}
          name="difficulty"
          value={recipes[editIndex].difficulty}
          onChange={(e) => handleInputChange(e, editIndex)}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <div className="popup-actions">
          <button className="save-button" onClick={() => handleSaveEdit(editIndex)}>
            Save
          </button>
          <button className="cancel-button" onClick={() => setEditIndex(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
</div>

    </div>
  );
};

export default Recipe;
