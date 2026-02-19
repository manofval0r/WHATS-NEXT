"""
Data Scientist — Career Path Catalog (Expanded)
================================================
From Python basics through statistics, machine learning,
deep learning, and MLOps. A complete path to becoming a
data professional who can extract insights and build models.

Modules: 14 (hard skills + soft skills + capstone)
"""

DATA_SCIENTIST = {
    "role": "data",
    "title": "Data Scientist",
    "description": "From Python basics through statistics, machine learning, deep learning, and MLOps. Extract insights from data and build models that solve real problems.",
    "modules": [
        # ── 0  Python for Data Science ────────────────────────────
        {
            "label": "Python for Data Science",
            "description": "Python is the lingua franca of data science. Learn the language foundations and key libraries used in every data workflow.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Write a Python script that ingests a messy CSV file, cleans it (handles missing values, corrects data types), calculates summary statistics, and outputs a clean dataset and a text-based report. Use functions and classes for organization.",
            "resources": {
                "primary": [
                    {"title": "FreeCodeCamp - Data Analysis with Python", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "type": "interactive"},
                    {"title": "Python for Data Analysis (Book by Wes McKinney)", "url": "https://wesmckinney.com/book/", "type": "book"},
                    {"title": "Automate the Boring Stuff with Python", "url": "https://automatetheboringstuff.com/", "type": "book (free)"},
                ],
                "additional": [
                    {"title": "Real Python Tutorials", "url": "https://realpython.com/", "type": "docs"},
                    {"title": "Corey Schafer - Python YouTube Series", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTskP3x-b7iHiw3g1uO5k_H-", "type": "video"},
                    {"title": "Fluent Python (Book by Luciano Ramalho)", "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", "type": "book (premium)"},
                    {"title": "Exercism - Python Track", "url": "https://exercism.org/tracks/python", "type": "interactive"},
                    {"title": "DataCamp - Introduction to Python", "url": "https://www.datacamp.com/courses/intro-to-python-for-data-science", "type": "interactive (premium)"},
                ],
            },
            "lessons": [
                {"title": "Setup: Python, venv & Jupyter/VS Code", "description": "Installing Python, pip, using `venv`, setting up Jupyter Notebooks and VS Code for data science.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Variables & Core Data Types", "description": "Strings, integers, floats, booleans, lists, dictionaries, tuples, sets.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Control Flow & Comprehensions", "description": "if/else, for, while, and writing pythonic list/dict comprehensions.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Functions, Lambda & Map/Filter", "description": "def, return, lambda functions, map, filter, *args/**kwargs, type hints.", "phase": 1, "order": 4, "estimated_minutes": 30},
                {"title": "Working with Files & APIs", "description": "Reading CSV/JSON, context managers (`with`), consuming APIs with `requests`.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "String Manipulation & Regex", "description": "f-strings, `.split()`, `.join()`, and using the `re` module for text cleaning.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Error Handling & Debugging", "description": "try/except/finally, raising exceptions, basic debugging techniques.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "Object-Oriented Programming (OOP) for DS", "description": "Using classes to structure data pipelines and modeling workflows (`__init__`, methods).", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Modules, Packages & `requirements.txt`", "description": "Importing code, `pip install`, and creating reproducible environments.", "phase": 3, "order": 9, "estimated_minutes": 20},
                {"title": "Code Quality: PEP 8 & Docstrings", "description": "Writing clean, readable code with linters, formatters, and good documentation.", "phase": 3, "order": 10, "estimated_minutes": 20},
            ],
        },

        # ── 1  Statistics & Probability ───────────────────────────
        {
            "label": "Statistics & Probability",
            "description": "The mathematical foundation of data science. Understand distributions, hypothesis testing, correlation, and Bayesian thinking.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3, 4],
            "project_prompt": "Analyze a real-world dataset. Perform a full statistical analysis: calculate descriptive stats, visualize distributions, conduct t-tests and chi-squared tests, build confidence intervals, and write a formal statistical report of your findings.",
            "resources": {
                "primary": [
                    {"title": "Khan Academy - Statistics & Probability", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "interactive"},
                    {"title": "StatQuest with Josh Starmer (YouTube)", "url": "https://www.youtube.com/@statquest", "type": "video"},
                    {"title": "An Introduction to Statistical Learning (Book, Free)", "url": "https://www.statlearning.com/", "type": "book"},
                ],
                "additional": [
                    {"title": "3Blue1Brown - Essence of Linear Algebra/Calculus", "url": "https://www.youtube.com/@3blue1brown", "type": "video"},
                    {"title": "Think Stats (Book, Free)", "url": "https://greenteapress.com/wp/think-stats-2e/", "type": "book"},
                    {"title": "Seeing Theory (Visualizations)", "url": "https://seeing-theory.brown.edu/", "type": "interactive"},
                    {"title": "Brilliant.org - Statistics", "url": "https://brilliant.org/courses/statistics/", "type": "interactive (premium)"},
                ],
            },
            "lessons": [
                {"title": "Descriptive Statistics", "description": "Mean, median, mode, variance, standard deviation, quartiles, skewness.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Probability Fundamentals", "description": "Sample space, events, conditional probability, independence, Bayes' Theorem.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Common Probability Distributions", "description": "Normal, Binomial, Poisson, Uniform — properties and applications.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Linear Algebra Essentials", "description": "Vectors, matrices, dot products, and their geometric intuition for data.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "The Central Limit Theorem", "description": "Sampling distributions, standard error, and its importance in inference.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Hypothesis Testing", "description": "Null/alternative hypotheses, p-values, Type I/II errors, t-tests, chi-squared tests.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Confidence Intervals", "description": "Calculating and interpreting confidence intervals for means and proportions.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Correlation & Simple Linear Regression", "description": "Pearson/Spearman correlation, covariance, fitting a line, R-squared.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "A/B Testing Design & Analysis", "description": "Formulating hypotheses, power analysis, statistical significance, pitfalls.", "phase": 3, "order": 9, "estimated_minutes": 30},
                {"title": "Bayesian Thinking", "description": "Prior, likelihood, posterior — contrasting with frequentist approaches.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git & Version Control for Data ─────────────────────
        {
            "label": "Git & Version Control for Data",
            "description": "Track your code, notebooks, and experiments. Git, GitHub, and data versioning tools for reproducible data science.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a data science project using the Cookiecutter template. Initialize Git, use DVC to track a dataset, add an experiment tracked with MLflow, and push the entire versioned project to GitHub.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "DVC (Data Version Control) - Get Started", "url": "https://dvc.org/doc/start", "type": "docs"},
                    {"title": "Cookiecutter Data Science Template", "url": "https://drivendata.github.io/cookiecutter-data-science/", "type": "tool"},
                ],
                "additional": [
                    {"title": "MLflow - Tracking Quickstart", "url": "https://mlflow.org/docs/latest/tracking.html", "type": "docs"},
                    {"title": "nbdime - Notebook Diffing", "url": "https://nbdime.readthedocs.io/en/latest/", "type": "tool"},
                    {"title": "Atlassian Git Tutorial", "url": "https://www.atlassian.com/git", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Git Basics for Data Science", "description": "init, add, commit, push. Using `.gitignore` for data, outputs, and secrets.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Branching & GitHub Workflow", "description": "Feature branches, pull requests (PRs), code reviews for collaboration.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Managing Jupyter Notebook Diffs", "description": "The challenge of versioning notebooks; using tools like `nbdime`.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Data Versioning with DVC", "description": "Tracking large datasets without committing them to Git; remote storage (S3/GCS).", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Experiment Tracking with MLflow", "description": "Logging parameters, metrics, and models to compare experiment runs.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Creating Reproducible Projects", "description": "Using Cookiecutter, `requirements.txt`, and documented pipelines.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },

        # ── 3  Pandas & NumPy ─────────────────────────────────────
        {
            "label": "Pandas & NumPy",
            "description": "The core tools of data manipulation. Master DataFrames, Series, array operations, and efficient data wrangling patterns.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Perform a full data cleaning and feature engineering task on a messy, multi-table dataset. Handle missing data, merge tables, create new features using `.apply()` and vectorized operations, and write a clean, well-documented Jupyter notebook explaining your steps.",
            "resources": {
                "primary": [
                    {"title": "Kaggle - Pandas Course", "url": "https://www.kaggle.com/learn/pandas", "type": "interactive"},
                    {"title": "Python for Data Analysis (Book by Wes McKinney)", "url": "https://wesmckinney.com/book/", "type": "book"},
                    {"title": "Pandas Official User Guide", "url": "https://pandas.pydata.org/docs/user_guide/index.html", "type": "docs"},
                ],
                "additional": [
                    {"title": "NumPy: the absolute basics for beginners", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "type": "docs"},
                    {"title": "Corey Schafer - Pandas YouTube Series", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS", "type": "video"},
                    {"title": "Modern Polars (Fast Alternative)", "url": "https://pola-rs.github.io/polars-book/user-guide/", "type": "docs"},
                    {"title": "Effective Pandas (Book by Matt Harrison)", "url": "https://www.amazon.com/Effective-Pandas-Patterns-Manipulation-Treading/dp/B09MYV6H18", "type": "book (premium)"},
                ],
            },
            "lessons": [
                {"title": "NumPy Arrays & Vectorization", "description": "Creating arrays, shapes, dtypes, indexing, slicing, and vectorized math.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Pandas Series & DataFrames", "description": "Creating, indexing with `loc`/`iloc`, dtypes, `info()`, `describe()`.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Data Selection & Boolean Indexing", "description": "`.query()`, `.isin()`, and combining multiple conditions for filtering.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Handling Missing Data", "description": "Strategies for dealing with NaNs: `isna()`, `fillna()`, `dropna()`, interpolation.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "GroupBy & Aggregation", "description": "The split-apply-combine pattern: `groupby()`, `agg()`, `transform()`, pivot tables.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Merging, Joining & Concatenating", "description": "Combining DataFrames with `merge`, `concat`, and `join`.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Method Chaining & Pipelines", "description": "Writing clean, readable data transformations with method chaining.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "Time Series Analysis", "description": "Working with `DatetimeIndex`, resampling, rolling windows, shifting.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Advanced Manipulation", "description": "Using `.apply()`, `map()`, working with categorical data, multi-level indexing.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Performance & Large Datasets", "description": "Memory optimization, efficient dtypes, using `Dask` or `Polars` for out-of-memory data.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 4  Data Visualization ─────────────────────────────────
        {
            "label": "Data Visualization",
            "description": "Tell stories with data. Master Matplotlib, Seaborn, and Plotly to create publication-quality charts and interactive dashboards.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Create an exploratory data analysis (EDA) report in a Jupyter notebook for a complex dataset. The report should feature at least 8 distinct, well-labeled, and insightful visualizations using Matplotlib/Seaborn. Then, build a simple interactive dashboard with Streamlit or Plotly Dash that allows a user to explore a key aspect of the data.",
            "resources": {
                "primary": [
                    {"title": "Seaborn Official Tutorials & Gallery", "url": "https://seaborn.pydata.org/tutorial.html", "type": "docs"},
                    {"title": "From Data to Viz (Chart Chooser)", "url": "https://www.data-to-viz.com/", "type": "docs"},
                    {"title": "Storytelling with Data (Book by Cole Nussbaumer Knaflic)", "url": "http://www.storytellingwithdata.com/book", "type": "book"},
                ],
                "additional": [
                    {"title": "Matplotlib Official Tutorials", "url": "https://matplotlib.org/stable/tutorials/index.html", "type": "docs"},
                    {"title": "Plotly Python Library", "url": "https://plotly.com/python/", "type": "docs"},
                    {"title": "Streamlit Documentation", "url": "https://docs.streamlit.io/", "type": "tool"},
                    {"title": "Fundamentals of Data Visualization (Book, Free)", "url": "https://clauswilke.com/dataviz/", "type": "book"},
                ],
            },
            "lessons": [
                {"title": "Principles of Effective Visualization", "description": "Choosing the right chart, data-ink ratio, avoiding clutter, accessibility.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Matplotlib: Anatomy of a Plot", "description": "Figures, Axes, Subplots — the foundational components for customization.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Seaborn for Statistical Plots", "description": "Distributions (histplot, kdeplot), relationships (scatterplot, relplot), categories (boxplot, violinplot).", "phase": 1, "order": 3, "estimated_minutes": 35},
                {"title": "Customizing Plots & Storytelling", "description": "Titles, labels, legends, annotations, colors, and building a narrative.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Visualizing Matrices & Facets", "description": "Using `heatmap` for correlations and `FacetGrid` or `PairGrid` for multi-plot exploration.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Interactive Visualizations with Plotly", "description": "Using `plotly.express` for quick, interactive charts with hover, zoom, and filters.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Building Interactive Dashboards", "description": "Creating simple data apps with Streamlit or Plotly Dash.", "phase": 3, "order": 7, "estimated_minutes": 40},
                {"title": "Geospatial Visualization", "description": "Introduction to `GeoPandas` and creating maps with libraries like `folium`.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 5  SQL for Data Analysis ──────────────────────────────
        {
            "label": "SQL for Data Analysis",
            "description": "Most business data lives in databases. Write analytical SQL queries to extract, transform, and analyze data at scale.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Using a relational database (e.g., PostgreSQL with a sample dataset), write 20 analytical queries to answer business questions. The queries must include CTEs, window functions (for ranking/running totals), and complex date-based aggregations.",
            "resources": {
                "primary": [
                    {"title": "Mode Analytics SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"},
                    {"title": "SQLBolt - Interactive Lessons", "url": "https://sqlbolt.com/", "type": "interactive"},
                    {"title": "LeetCode - Database Problems", "url": "https://leetcode.com/problemset/database/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "docs"},
                    {"title": "dbt (Data Build Tool) Fundamentals", "url": "https://courses.getdbt.com/courses/dbt-fundamentals", "type": "interactive"},
                    {"title": "SQL for Data Scientists (Book by Renee Teate)", "url": "https://www.amazon.com/SQL-Data-Scientists-Data-Analysis-dp-109810579X/dp/109810579X", "type": "book (premium)"},
                ],
            },
            "lessons": [
                {"title": "SQL Fundamentals", "description": "SELECT, FROM, WHERE, ORDER BY, LIMIT, DISTINCT, aliases.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Filtering with Advanced WHERE", "description": "LIKE, IN, BETWEEN, IS NULL, AND/OR logic.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "JOINs for Analysis", "description": "INNER, LEFT, and self-joins for combining data from multiple tables.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Aggregation & GROUP BY", "description": "COUNT, SUM, AVG, MIN, MAX. Using `HAVING` to filter groups.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Common Table Expressions (CTEs)", "description": "Using the `WITH` clause to write clean, modular, and readable queries.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Window Functions", "description": "RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD, and running totals with `OVER()`.", "phase": 2, "order": 6, "estimated_minutes": 40},
                {"title": "Date & Time Manipulation", "description": "DATE_TRUNC, EXTRACT, intervals, and time zone handling.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Advanced SQL", "description": "CASE statements, COALESCE, string functions, UNION.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Connecting to DBs with Python", "description": "Using `SQLAlchemy` or `psycopg2` to run queries and fetch data into Pandas.", "phase": 3, "order": 9, "estimated_minutes": 25},
            ],
        },

        # ── 6  Machine Learning Fundamentals ──────────────────────
        {
            "label": "Machine Learning Fundamentals",
            "description": "The core theory and practice of ML. Supervised and unsupervised learning, bias-variance tradeoff, cross-validation, and model evaluation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "On a Kaggle dataset, build and compare three different models for a classification task (e.g., Logistic Regression, Random Forest, Gradient Boosting). Perform feature engineering, use cross-validation, and evaluate them using multiple metrics (Accuracy, Precision, Recall, F1, ROC-AUC). Write a report justifying your final model choice.",
            "resources": {
                "primary": [
                    {"title": "Coursera - Machine Learning by Andrew Ng", "url": "https://www.coursera.org/learn/machine-learning", "type": "video"},
                    {"title": "StatQuest - Machine Learning Playlist", "url": "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF", "type": "video"},
                    {"title": "An Introduction to Statistical Learning (Book, Free)", "url": "https://www.statlearning.com/", "type": "book"},
                ],
                "additional": [
                    {"title": "Kaggle - Intro to Machine Learning", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "type": "interactive"},
                    {"title": "Google - Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "interactive"},
                    {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "The ML Workflow", "description": "Supervised vs Unsupervised vs Reinforcement learning. Framing problems.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Linear & Logistic Regression", "description": "Fitting lines, cost functions, gradient descent, sigmoid, decision boundaries.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "Train/Validation/Test & Cross-Validation", "description": "The problem of overfitting, k-fold cross-validation, stratification.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "The Bias-Variance Tradeoff", "description": "Underfitting vs overfitting, and the role of model complexity.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Feature Engineering & Preprocessing", "description": "Scaling (Standard, MinMax), encoding (OneHot, Ordinal), creating interaction terms.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Tree-Based Models", "description": "Decision Trees, Random Forests, Gradient Boosting (XGBoost, LightGBM), feature importance.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Model Evaluation Metrics (Classification)", "description": "Confusion matrix, accuracy, precision, recall, F1-score, ROC curve, AUC.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Model Evaluation Metrics (Regression)", "description": "MAE, MSE, RMSE, R-squared. Understanding their pros and cons.", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "Regularization", "description": "L1 (Lasso) and L2 (Ridge) regularization to combat overfitting.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Unsupervised Learning: Clustering", "description": "K-Means, DBSCAN, evaluating clusters with silhouette scores.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "Hyperparameter Tuning", "description": "GridSearchCV, RandomizedSearchCV, and an introduction to Bayesian optimization.", "phase": 3, "order": 11, "estimated_minutes": 25},
            ],
        },

        # ── 7  Scikit-learn Applied ───────────────────────────────
        {
            "label": "Scikit-learn Applied",
            "description": "Put ML theory into practice. Build end-to-end ML pipelines with scikit-learn — from data preprocessing to model deployment.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Build a complete, end-to-end scikit-learn pipeline for a real-world problem. The pipeline must handle data cleaning, preprocessing for numeric and categorical features, model training, and hyperparameter tuning. Serialize the final pipeline object and demonstrate its use on new, unseen data.",
            "resources": {
                "primary": [
                    {"title": "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow (Book)", "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125964/", "type": "book (premium)"},
                    {"title": "Scikit-learn Official Tutorials", "url": "https://scikit-learn.org/stable/tutorial/index.html", "type": "docs"},
                    {"title": "Kaggle - Intermediate Machine Learning", "url": "https://www.kaggle.com/learn/intermediate-machine-learning", "type": "interactive"},
                ],
                "additional": [
                    {"title": "scikit-learn-contrib projects", "url": "https://scikit-learn-contrib.github.io/", "type": "docs"},
                    {"title": "SHAP (Model Explainability)", "url": "https://shap.readthedocs.io/en/latest/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Scikit-learn's Estimator API", "description": "The `.fit()`, `.predict()`, `.transform()` interface common to all objects.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Building Pipelines", "description": "Using `Pipeline` to chain preprocessing and modeling steps.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Preprocessing with `ColumnTransformer`", "description": "Applying different transformations to different columns (e.g., scaling vs one-hot encoding).", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Advanced Ensemble Models", "description": "Using `GradientBoostingClassifier`, `XGBoost`, `LightGBM`, and `StackingClassifier`.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Dimensionality Reduction", "description": "Using PCA for feature reduction and t-SNE/UMAP for visualization.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Handling Imbalanced Data", "description": "Strategies like class weights and over/under-sampling (SMOTE).", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Model Interpretability", "description": "Explaining predictions with `SHAP` and `LIME`.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Model Serialization & Persistence", "description": "Saving and loading trained pipelines with `joblib` for deployment.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 8  Deep Learning Introduction ─────────────────────────
        {
            "label": "Deep Learning Introduction",
            "description": "Neural networks from scratch. Understand backpropagation, build networks with PyTorch, and apply deep learning to real problems.",
            "market_value": "High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Using PyTorch, build and train a Convolutional Neural Network (CNN) from scratch for an image classification task (e.g., CIFAR-10). Then, use transfer learning with a pre-trained model (e.g., ResNet) and compare the performance. Log your experiments with TensorBoard.",
            "resources": {
                "primary": [
                    {"title": "fast.ai - Practical Deep Learning for Coders", "url": "https://course.fast.ai/", "type": "interactive"},
                    {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "type": "docs"},
                    {"title": "Andrej Karpathy - Neural Networks: Zero to Hero (YouTube)", "url": "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", "type": "video"},
                ],
                "additional": [
                    {"title": "3Blue1Brown - Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", "type": "video"},
                    {"title": "Deep Learning with PyTorch (Book, Free)", "url": "https://pytorch.org/assets/deep-learning/Deep-Learning-with-PyTorch.pdf", "type": "book"},
                    {"title": "Deep Learning Book (Goodfellow et al.)", "url": "https://www.deeplearningbook.org/", "type": "book"},
                ],
            },
            "lessons": [
                {"title": "Neural Networks: The Big Picture", "description": "Neurons, layers, activation functions (ReLU, Sigmoid), forward propagation.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Backpropagation & Gradient Descent", "description": "Chain rule intuition, loss functions, learning rates, optimizers (Adam, SGD).", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "PyTorch Fundamentals", "description": "Tensors, `autograd` for automatic differentiation, using GPUs.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Building a Network with `nn.Module`", "description": "`nn.Linear`, defining the `forward` method, and writing a complete training loop.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Convolutional Neural Networks (CNNs)", "description": "Convolutions, pooling, padding, building CNNs for image data.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Training Best Practices", "description": "Data augmentation, batch normalization, dropout, learning rate schedules.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Transfer Learning for Vision", "description": "Using pre-trained models (e.g., ResNet), feature extraction vs fine-tuning.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Recurrent Neural Networks (RNNs)", "description": "LSTMs, GRUs for sequence data like time series or text.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Intro to Transformers & Hugging Face", "description": "Basic concepts of attention and using pre-trained NLP models.", "phase": 3, "order": 9, "estimated_minutes": 35},
            ],
        },

        # ── 9  MLOps & Model Deployment ───────────────────────────
        {
            "label": "MLOps & Model Deployment",
            "description": "Ship ML models to production. Experiment tracking, model versioning, APIs, Docker, monitoring, and CI/CD for ML.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Take a trained scikit-learn model, wrap it in a FastAPI service, and containerize it with Docker. Set up a GitHub Actions pipeline that automatically tests the API and builds the Docker image on push. Deploy the container to a cloud service like Hugging Face Spaces or Render.",
            "resources": {
                "primary": [
                    {"title": "Made With ML - MLOps", "url": "https://madewithml.com/", "type": "interactive"},
                    {"title": "Full Stack Deep Learning", "url": "https://fullstackdeeplearning.com/course/2022/", "type": "interactive"},
                    {"title": "MLflow Official Docs", "url": "https://mlflow.org/docs/latest/index.html", "type": "docs"},
                ],
                "additional": [
                    {"title": "FastAPI Official Docs", "url": "https://fastapi.tiangolo.com/", "type": "tool"},
                    {"title": "Evidently AI (Drift Monitoring)", "url": "https://www.evidentlyai.com/", "type": "tool"},
                    {"title": "BentoML (Model Serving Framework)", "url": "https://www.bentoml.com/", "type": "tool"},
                ],
            },
            "lessons": [
                {"title": "The MLOps Lifecycle", "description": "From data to deployment; understanding technical debt in ML systems.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Advanced Experiment Tracking", "description": "Using MLflow for tracking, model registry, and comparing experiments.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Serving Models as APIs", "description": "Building a prediction service with FastAPI and Pydantic for data validation.", "phase": 1, "order": 3, "estimated_minutes": 35},
                {"title": "Containerizing ML Apps with Docker", "description": "Writing a Dockerfile for a Python ML service, managing dependencies.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "CI/CD for Machine Learning", "description": "Using GitHub Actions to automate testing, linting, and building artifacts.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Model & Data Monitoring", "description": "Detecting data drift, concept drift, and performance degradation in production.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Cloud Deployment Platforms", "description": "Deploying containers to Render, Hugging Face Spaces, or an intro to AWS SageMaker/GCP Vertex AI.", "phase": 3, "order": 7, "estimated_minutes": 30},
            ],
        },

        # ── 10  Natural Language Processing ───────────────────────
        {
            "label": "Natural Language Processing",
            "description": "Make computers understand text. From text preprocessing through transformers, sentiment analysis, and LLM applications.",
            "market_value": "High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Build a multi-class text classification system using the Hugging Face ecosystem. Preprocess a text dataset, fine-tune a pre-trained transformer model (like DistilBERT), evaluate its performance, and create an interactive demo with Gradio or Streamlit.",
            "resources": {
                "primary": [
                    {"title": "Hugging Face - NLP Course", "url": "https://huggingface.co/learn/nlp-course", "type": "interactive"},
                    {"title": "The Illustrated Transformer (Blog)", "url": "https://jalammar.github.io/illustrated-transformer/", "type": "docs"},
                    {"title": "LangChain Docs", "url": "https://python.langchain.com/docs/get_started/introduction", "type": "docs"},
                ],
                "additional": [
                    {"title": "spaCy 101: Everything you need to know", "url": "https://spacy.io/usage/spacy-101", "type": "docs"},
                    {"title": "Natural Language Processing with Transformers (Book)", "url": "https://www.oreilly.com/library/view/natural-language-processing/9781098136782/", "type": "book (premium)"},
                ],
            },
            "lessons": [
                {"title": "Classic NLP: Text Preprocessing & TF-IDF", "description": "Tokenization, stop words, stemming, lemmatization, and bag-of-words.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Word Embeddings", "description": "Word2Vec, GloVe — capturing semantic meaning of words.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "The Transformer Architecture & Attention", "description": "The self-attention mechanism that powers modern NLP.", "phase": 1, "order": 3, "estimated_minutes": 35},
                {"title": "Using the Hugging Face Ecosystem", "description": "`datasets`, `tokenizers`, and `transformers` libraries for efficient workflows.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Fine-tuning Pre-trained Transformers", "description": "Transfer learning for NLP tasks like text classification and NER.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Building LLM Applications: Prompt Engineering", "description": "Designing effective prompts to guide Large Language Models.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Building LLM Applications: RAG", "description": "Retrieval-Augmented Generation to ground LLMs in private data.", "phase": 3, "order": 7, "estimated_minutes": 35},
                {"title": "Vector Databases", "description": "Understanding embeddings and using vector stores like ChromaDB or Pinecone for RAG.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 11  Big Data & Cloud ──────────────────────────────────
        {
            "label": "Big Data & Cloud",
            "description": "Work with data that doesn't fit in memory. Introduction to Spark, cloud platforms (AWS/GCP), and scalable data processing.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Using PySpark (on Databricks Community Edition or locally), process a large dataset (>1GB). Build an ETL pipeline that reads from a source, performs complex transformations and aggregations, and writes the cleaned data to Parquet format.",
            "resources": {
                "primary": [
                    {"title": "Data Engineering Zoomcamp (Free Course)", "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp", "type": "interactive"},
                    {"title": "Databricks Community Edition", "url": "https://community.cloud.databricks.com/", "type": "interactive"},
                    {"title": "Learning Spark, 2nd Edition (Book)", "url": "https://pages.databricks.com/rs/094-YMS-629/images/LearningSpark2.0.pdf", "type": "book (free)"},
                ],
                "additional": [
                    {"title": "PySpark API Reference", "url": "https://spark.apache.org/docs/latest/api/python/", "type": "docs"},
                    {"title": "AWS S3 / Google Cloud Storage Docs", "url": "https://aws.amazon.com/s3/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Big Data Concepts", "description": "The 3 Vs, distributed computing, MapReduce intuition.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "PySpark Fundamentals", "description": "SparkSession, DataFrames, lazy evaluation, transformations vs actions.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "Data Manipulation with PySpark", "description": "Selecting, filtering, grouping, and joining data in a distributed way.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Cloud Storage & Data Lakes", "description": "Using AWS S3 or GCS as a scalable storage layer.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "ETL vs ELT Pipelines", "description": "Understanding modern data pipeline architectures.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "Data Warehouses vs Data Lakes", "description": "BigQuery, Redshift, Snowflake vs S3/GCS. When to use each.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Introduction to Data Orchestration", "description": "What Airflow and Dagster do; defining data dependencies in DAGs.", "phase": 3, "order": 7, "estimated_minutes": 25},
            ],
        },

        # ── 12  Data Science Capstone ─────────────────────────────
        {
            "label": "Data Science Capstone Project",
            "description": "Build an end-to-end data science project: problem definition, data collection, analysis, ML model, deployment, and presentation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Choose a unique problem and execute a complete data science project. This must include: a clear problem definition, data acquisition (e.g., via API or scraping), extensive EDA, building and comparing multiple ML models, and deploying the best model as an interactive web app (Streamlit/Gradio) or a REST API.",
            "resources": {
                "primary": [
                    {"title": "Kaggle Competitions & Datasets", "url": "https://www.kaggle.com/", "type": "interactive"},
                    {"title": "DrivenData Competitions for Social Good", "url": "https://www.drivendata.org/competitions/", "type": "interactive"},
                    {"title": "Cookiecutter Data Science Template", "url": "https://drivendata.github.io/cookiecutter-data-science/", "type": "tool"},
                ],
                "additional": [
                    {"title": "Awesome Public Datasets (GitHub)", "url": "https://github.com/awesomedata/awesome-public-datasets", "type": "docs"},
                    {"title": "Streamlit & Gradio (for demos)", "url": "https://streamlit.io/", "type": "tool"},
                ],
            },
            "lessons": [
                {"title": "Defining the Business Problem & Success Metrics", "description": "Translating a business need into a data science problem (e.g., classification, regression).", "phase": 1, "order": 1, "estimated_minutes": 40},
                {"title": "Data Acquisition & Cleaning", "description": "Sourcing data via APIs, scraping, or public datasets, and performing initial cleaning.", "phase": 1, "order": 2, "estimated_minutes": 45},
                {"title": "Exploratory Data Analysis (EDA)", "description": "Deeply exploring the data to generate hypotheses and inform feature engineering.", "phase": 2, "order": 3, "estimated_minutes": 50},
                {"title": "Modeling & Hyperparameter Tuning", "description": "Systematically building, evaluating, and tuning multiple models.", "phase": 2, "order": 4, "estimated_minutes": 50},
                {"title": "Model Deployment & Demo", "description": "Creating an API endpoint or an interactive web app to showcase your model.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Project Documentation & Presentation", "description": "Writing a high-quality README, a blog post, and preparing a presentation for stakeholders.", "phase": 3, "order": 6, "estimated_minutes": 35},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Translate data into decisions. Learn to present findings, write reports, collaborate with stakeholders, and ace data science interviews.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Write a detailed blog post explaining a complex machine learning concept (e.g., 'An Intuitive Guide to the Bias-Variance Tradeoff'). Create a 5-minute recorded presentation of your capstone project aimed at a non-technical audience. Contribute a helpful comment or fork and improve a Kaggle notebook.",
            "resources": {
                "primary": [
                    {"title": "Storytelling with Data (Book & Blog)", "url": "http://www.storytellingwithdata.com/", "type": "book"},
                    {"title": "Ace the Data Science Interview (Book)", "url": "https://www.acethedatascienceinterview.com/", "type": "book"},
                    {"title": "Technical Writing Courses (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                ],
                "additional": [
                    {"title": "STAR Method for Behavioral Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "Towards Data Science (Publication)", "url": "https://towardsdatascience.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Communicating Insights to Stakeholders", "description": "Translating statistical results and model outputs into business impact.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Building Effective Presentations", "description": "Structuring a data narrative, designing clear slides, and presenting with confidence.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Writing for Data Science", "description": "Creating reproducible reports in notebooks, writing blog posts, and documentation.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Agile & Team Collaboration", "description": "Working in data science teams using Agile/Scrum methodologies.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Data Science Interview Prep", "description": "Acing technical screens (SQL, Python), modeling case studies, and take-home challenges.", "phase": 3, "order": 5, "estimated_minutes": 35},
                {"title": "Building a Standout Portfolio", "description": "Curating your GitHub, Kaggle profile, and personal blog to showcase your skills.", "phase": 3, "order": 6, "estimated_minutes": 30},
                {"title": "Ethics in Data Science", "description": "Understanding and mitigating bias, ensuring fairness, and respecting privacy.", "phase": 3, "order": 7, "estimated_minutes": 25},
            ],
        },
    ],
}